import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createDonationIntent, confirmDonation } from "../api/donations";

export default function DonationForm({ campaignId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  // form state
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not ready.");
      return;
    }

    setSubmitting(true);

    try {
      // 1) Create intent
      const data = await createDonationIntent({
        campaignId,
        donorName,
        donorEmail,
        amount,
        message,
      });

      const donationId = data?.donation?._id;
      const clientSecret = data?.clientSecret;

      if (!donationId || !clientSecret) {
        throw new Error("Missing donationId or clientSecret from server.");
      }

      // 2) Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: donorName, email: donorEmail || undefined },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const status = result?.paymentIntent?.status;
      if (status !== "succeeded") {
        throw new Error(`Payment status: ${status}`);
      }

      // 3) Finalize donation
      await confirmDonation(donationId);

      setSuccess(true);

      // nice UX reset (optional)
      cardElement.clear();
      setDonorName("");
      setDonorEmail("");
      setAmount(5);
      setMessage("");

      onSuccess?.();
    } catch (err) {
      setError(err?.message || String(err) || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <label style={{ display: "block", marginBottom: 10 }}>
        Name
        <input
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 10 }}>
        Email (optional)
        <input
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          type="email"
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 10 }}>
        Amount (USD)
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Message (optional)
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Card Details
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          <CardElement />
        </div>
      </label>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Donation successful — thank you!</p>}

      <button className="btn btn-give" type="submit" disabled={submitting || !stripe}>
        {submitting ? "Processing…" : "Donate now"}
      </button>
    </form>
  );
}