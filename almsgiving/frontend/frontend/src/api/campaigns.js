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
  const fd = new FormData();

  fd.append("title", payload.title || "");
  fd.append("description", payload.description || "");
  fd.append("goalAmount", String(payload.goalAmount ?? 0));
  fd.append("status", payload.status || "active");

  // optional manual URL
  if (payload.imageUrl) fd.append("imageUrl", payload.imageUrl);

  // optional file upload (key must match multer: upload.single("image"))
  if (payload.imageFile) fd.append("image", payload.imageFile);

  return apiFetch("/campaigns", {
    method: "POST",
    body: fd,
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
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  const fd = new FormData();

  if (payload.title != null) fd.append("title", payload.title);
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.goalAmount != null) fd.append("goalAmount", String(payload.goalAmount));
  if (payload.status != null) fd.append("status", payload.status);

  // optional manual URL
  if (payload.imageUrl != null) fd.append("imageUrl", payload.imageUrl);

  // optional file upload
  if (payload.imageFile) fd.append("image", payload.imageFile);

  return apiFetch(`/campaigns/${id.trim()}`, {
    method: "PATCH",
    body: fd,
  });
}