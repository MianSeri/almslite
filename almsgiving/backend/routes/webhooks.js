const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------------------
// Mail transport (SMTP OR Ethereal fallback)
// ------------------------------
let mailer = null;
let mailMode = null; // "smtp" | "ethereal"

async function getMailer() {
  if (mailer) return mailer;

  const hasSMTP =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.FROM_EMAIL;

  if (hasSMTP) {
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // 465=true, 587=false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    mailMode = "smtp";
    console.log("Mailer initialized: SMTP");
    return mailer;
  }

  // Ethereal fallback (safe for dev/capstone)
  const testAccount = await nodemailer.createTestAccount();

  console.log("Ethereal account created:");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);

  mailer = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  mailMode = "ethereal";

  // Ensure FROM_EMAIL exists so sendMail always works
  if (!process.env.FROM_EMAIL) {
    process.env.FROM_EMAIL = `Alms <${testAccount.user}>`;
  }

  return mailer;
}

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildReceiptEmail({
  donorName,
  donorEmail,
  amount,
  campaignTitle,
  nonprofitName,
  donationId,
}) {
  const safeDonor = donorName || "Friend";
  const safeCampaign = campaignTitle || "your campaign";
  const safeOrg = nonprofitName || "the nonprofit";
  const dollars = formatMoney(amount);

  const subject = `Receipt: $${dollars} donation to ${safeOrg}`;

  const text = `Thanks, ${safeDonor}!

We received your donation of $${dollars} to "${safeCampaign}".

Donation ID: ${donationId}

No goods or services were provided in exchange for this donation.
If you have questions, reply to this email.`;

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a;">
    <h2 style="margin:0 0 8px;">Donation receipt</h2>
    <p style="margin:0 0 14px;">Thanks, <strong>${escapeHtml(
      safeDonor
    )}</strong> — we received your donation.</p>

    <div style="border:1px solid rgba(15,23,42,0.12); border-radius:14px; padding:14px; background:#fff;">
      <p style="margin:0 0 8px;"><strong>Amount:</strong> $${escapeHtml(
        dollars
      )}</p>
      <p style="margin:0 0 8px;"><strong>Campaign:</strong> ${escapeHtml(
        safeCampaign
      )}</p>
      <p style="margin:0;"><strong>Donation ID:</strong> ${escapeHtml(
        donationId
      )}</p>
    </div>

    <p style="margin:14px 0 0; color:rgba(15,23,42,0.72); font-size:13px; line-height:1.45;">
      No goods or services were provided in exchange for this donation.
    </p>
  </div>`;

  return { to: donorEmail, subject, text, html };
}

async function sendReceiptEmail(payload) {
  const transport = await getMailer(); // guarantees mailer exists

  const { to, subject, text, html } = payload;

  const info = await transport.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  });

  if (mailMode === "ethereal") {
    console.log("Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("Receipt email sent via SMTP");
  }

  return { ok: true };
}

// IMPORTANT: this router MUST be mounted with express.raw() in server.js
router.post("/stripe", async (req, res) => {
  console.log("/webhooks/stripe HIT");

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Stripe signature verified. Event type:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const piId = paymentIntent.id;

    const chargeId =
      typeof paymentIntent.latest_charge === "string"
        ? paymentIntent.latest_charge
        : null;

    console.log("payment_intent.succeeded for PI:", piId);

    let receiptCandidate = null;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const donation = await Donation.findOne({
          paymentProvider: "stripe",
          providerPaymentId: piId,
        }).session(session);

        if (!donation) {
          console.warn("Donation not found for PI:", piId);
          return;
        }

        if (donation.paymentStatus === "paid") return; // idempotent

        donation.paymentStatus = "paid";
        donation.status = "COMPLETED";
        donation.confirmedAt = new Date();
        if (chargeId) donation.providerChargeId = chargeId;

        await donation.save({ session });

        await Campaign.findByIdAndUpdate(
          donation.campaignId,
          { $inc: { amountRaised: donation.amount } },
          { session }
        );

        receiptCandidate = {
          donationId: donation._id.toString(),
          donorEmail: donation.donorEmail,
          campaignId: donation.campaignId?.toString?.() || donation.campaignId,
        };

        console.log("Donation marked paid + campaign incremented");
      });

      // ---- AFTER COMMIT: send receipt (best effort) ----
      if (receiptCandidate?.donorEmail) {
        const campaign = await Campaign.findById(receiptCandidate.campaignId).select("title");
        const campaignTitle = campaign?.title || "";
        const nonprofitName = process.env.RECEIPT_ORG_NAME || "Alms";

        const fresh = await Donation.findOne({
          _id: receiptCandidate.donationId,
          paymentStatus: "paid",
          $or: [{ receiptSentAt: { $exists: false } }, { receiptSentAt: null }],
        }).select("_id donorName donorEmail amount receiptSentAt");

        if (!fresh) {
          console.log("Receipt already sent (or not eligible). Skipping email.");
        } else {
          const email = buildReceiptEmail({
            donorName: fresh.donorName,
            donorEmail: fresh.donorEmail,
            amount: fresh.amount,
            campaignTitle,
            nonprofitName,
            donationId: fresh._id.toString(),
          });

          try {
            const result = await sendReceiptEmail(email);
            if (result.ok) {
              await Donation.findByIdAndUpdate(fresh._id, {
                $set: { receiptSentAt: new Date() },
              });
              console.log("Receipt email sent + receiptSentAt set.");
            }
          } catch (mailErr) {
            console.error("Receipt email send failed:", mailErr?.message || mailErr);
          }
        }
      } else {
        console.log("No donorEmail on donation; skipping receipt email.");
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook handling error:", err);
      return res.status(500).json({ error: "Webhook handler failed" });
    } finally {
      session.endSession();
    }
  }

  return res.json({ received: true });
});

module.exports = router;