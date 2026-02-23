const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Stripe = require("stripe");

const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT to note: this router MUST be mounted with express.raw() in server.js
router.post("/stripe", async (req, res) => {
    console.log("✅ /webhooks/stripe HIT");
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

  console.log("✅ Stripe signature verified. Event type:", event.type);

  // We only need this one event for MVP
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object; // PI object
    const piId = paymentIntent.id;

    console.log("✅ payment_intent.succeeded for PI:", piId);

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Find donation linked to this PaymentIntent
        const donation = await Donation.findOne({
          paymentProvider: "stripe",
          providerPaymentId: piId,
        }).session(session);

        if (!donation) {
          console.warn("Donation not found for PI:", piId);
          return;
        }

        console.log(
            "✅ Donation found:",
            donation._id.toString(),
            "status:",
            donation.paymentStatus
          );

        // Idempotent: if already paid, do nothing
        if (donation.paymentStatus === "paid") return;

        // Mark donation paid
        donation.paymentStatus = "paid";
        await donation.save({ session });

        // Increment campaign amountRaised
        await Campaign.findByIdAndUpdate(
          donation.campaignId,
          { $inc: { amountRaised: donation.amount } },
          { session }
        );

        console.log("✅ Donation marked paid + campaign incremented");
      });

      // Stripe requires 2xx response
      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook handling error:", err);
      // Still return 200 sometimes to avoid Stripe retries looping forever,
      // but for dev we can return 500 to notice failures:
      return res.status(500).json({ error: "Webhook handler failed" });
    } finally {
      session.endSession();
    }
  }

  // Acknowledge all other events
  return res.json({ received: true });
});

module.exports = router;
