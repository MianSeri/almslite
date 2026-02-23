import { apiFetch } from "./clients";

// PUBLIC: GET /campaigns (list)
export async function getCampaigns() {
  const data = await apiFetch("/campaigns");

  // normalize response shape
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;

  return [];
}

// PUBLIC: GET /campaigns/:id (single)
export function getCampaign(id) {
  // HARD GUARD: prevents /campaigns/undefined forever
  if (!id || typeof id !== "string") {
    throw new Error("Missing campaign id");
  }

  const cleanId = id.trim();
  if (!cleanId) throw new Error("Missing campaign id");

  return apiFetch(`/campaigns/${cleanId}`);
}

// PROTECTED: GET /campaigns/mine/list
// Only keep this path if the backend really uses it.
export async function getMyCampaigns() {
  const data = await apiFetch("/campaigns/mine/list");

  // normalize response shape
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;

  return [];
}

// PROTECTED: POST /campaigns
export function createCampaign(payload) {
  return apiFetch("/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PROTECTED: DELETE /campaigns/:id
export async function deleteCampaign(id) {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  return apiFetch(`/campaigns/${id.trim()}`, {
    method: "DELETE",
  });
}

// PATCH /campaigns/:id
export async function updateCampaign(id, payload) {
  return apiFetch(`/campaigns/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}