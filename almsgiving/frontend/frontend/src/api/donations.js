import { apiFetch } from "./clients";

// POST /donations/intent
export async function createDonationIntent(payload) {
    return apiFetch("/donations/intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });
  }

// POST /donations/confirm
export async function confirmDonation(donationId) {
    return apiFetch("/donations/confirm", {
      method: "POST",
      body: JSON.stringify({ donationId }),
    });
  }