import { useMemo, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createDonationIntent, confirmDonation } from "../api/donations";
import "./DonationForm.css";

const PRESETS = [10, 25, 50, 100];

export default function DonationForm({ campaignId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  // form state
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Amount state (preset + custom)
  const [amount, setAmount] = useState(10);
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const [message, setMessage] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const finalAmount = useMemo(() => {
    if (!customMode) return Number(amount) || 0;
    const n = Number(customAmount);
    return Number.isFinite(n) ? n : 0;
  }, [amount, customAmount, customMode]);

  function selectPreset(v) {
    setCustomMode(false);
    setCustomAmount("");
    setAmount(v);
  }

  function chooseCustom() {
    setCustomMode(true);
    setCustomAmount("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!campaignId) return setError("Missing campaignId.");

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not ready.");
      return;
    }

    if (!finalAmount || finalAmount < 1) {
      setError("Please choose an amount of $1 or more.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await createDonationIntent({
        campaignId,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        amount: finalAmount,
        message: message.trim(),
      });

      const donationId = data?.donation?._id;
      const clientSecret = data?.clientSecret;

      if (!donationId || !clientSecret) {
        throw new Error("Missing donationId or clientSecret from server.");
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorName.trim(),
            email: donorEmail.trim() || undefined,
          },
        },
      });

      if (result.error) throw new Error(result.error.message);

      const status = result?.paymentIntent?.status;
      if (status !== "succeeded") throw new Error(`Payment status: ${status}`);

      await confirmDonation(donationId);

      setSuccess(true);

      cardElement.clear();
      setDonorName("");
      setDonorEmail("");
      setAmount(10);
      setCustomMode(false);
      setCustomAmount("");
      setMessage("");

      onSuccess?.();
    } catch (err) {
      setError(err?.message || String(err) || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const showCustomInput = customMode;
  const disableSubmit = submitting || !stripe;

  return (
    <form className="df" onSubmit={handleSubmit}>
      <div className="df-field">
        <label className="df-label" htmlFor="donorName">Name</label>
        <input
          id="donorName"
          className="df-input"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="df-field">
        <label className="df-label" htmlFor="donorEmail">Email (optional)</label>
        <input
          id="donorEmail"
          className="df-input"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
        />
      </div>

      {/* Amount */}
      <div className="df-field">
        <div className="df-labelRow">
          <span className="df-label">Amount (USD)</span>
          {!showCustomInput ? (
            <span className="df-mini">
              Selected: <strong>${finalAmount}</strong>
            </span>
          ) : (
            <span className="df-mini">Enter your amount</span>
          )}
        </div>

        <div className="df-pills" role="group" aria-label="Donation amount presets">
          {PRESETS.map((v) => {
            const active = !customMode && Number(amount) === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => selectPreset(v)}
                className={`df-pill ${active ? "is-active" : ""}`}
              >
                ${v}
              </button>
            );
          })}

          <button
            type="button"
            onClick={chooseCustom}
            className={`df-pill ${customMode ? "is-active" : ""}`}
          >
            Custom
          </button>
        </div>

        {showCustomInput ? (
          <div className="df-custom">
            <div className="df-currency">$</div>
            <input
              className="df-input df-input--currency"
              inputMode="numeric"
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="45"
              required
            />
          </div>
        ) : null}

        <p className="df-hint">Tip: presets are faster on mobile; custom is still available.</p>
      </div>

      <div className="df-field">
        <label className="df-label" htmlFor="message">Message (optional)</label>
        <input
          id="message"
          className="df-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          placeholder="Leave a note (optional)"
        />
      </div>

      <div className="df-field">
        <label className="df-label">Card Details</label>
        <div className="df-cardBox">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#0f172a",
                  "::placeholder": { color: "rgba(15,23,42,0.45)" },
                },
              },
            }}
          />
        </div>
      </div>

      {error ? <div className="df-alert df-alert--error">{error}</div> : null}
      {success ? (
        <div className="df-alert df-alert--success">Donation successful — thank you!</div>
      ) : null}

      <button className="btn btn-give df-submit" type="submit" disabled={disableSubmit}>
        {submitting ? "Processing…" : `Donate $${finalAmount || ""}`}
      </button>

      <div className="df-trust" aria-label="Payment trust information">
        <span className="df-dot" />
        Secure payments by Stripe
        <span className="df-sep">•</span>
        Email receipt sent
      </div>
    </form>
  );
}