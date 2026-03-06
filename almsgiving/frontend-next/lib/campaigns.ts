import { apiFetch } from "@/lib/api";

export type Campaign = {
  _id: string;
  nonprofitId?: string;
  title?: string;
  description?: string;
  goalAmount?: number;
  amountRaised?: number;
  status?: string;
  imageUrl?: string;
};

type CampaignListResponse =
  | Campaign[]
  | { campaigns: Campaign[] }
  | { data: Campaign[] };

function normalizeCampaignList(data: any): Campaign[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// PUBLIC: GET /campaigns (list)
export async function getCampaigns(): Promise<Campaign[]> {
  const data: CampaignListResponse = await apiFetch("/campaigns");
  return normalizeCampaignList(data);
}

// PUBLIC: GET /campaigns/:id (single)
export async function getCampaign(id: string): Promise<Campaign> {
  if (!id || typeof id !== "string") throw new Error("Missing campaign id");
  const cleanId = id.trim();
  if (!cleanId) throw new Error("Missing campaign id");
  return apiFetch(`/campaigns/${cleanId}`);
}

// PROTECTED: GET /campaigns/mine/list (keep only if your backend has it)
export async function getMyCampaigns(): Promise<Campaign[]> {
  const data: CampaignListResponse = await apiFetch("/campaigns/mine/list");
  return normalizeCampaignList(data);
}

export type CreateCampaignPayload = {
  title?: string;
  description?: string;
  goalAmount?: number;
  status?: string;
  imageUrl?: string;
  imageFile?: File;
};

// PROTECTED: POST /campaigns (multipart/form-data)
export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  const fd = new FormData();

  fd.append("title", payload.title || "");
  fd.append("description", payload.description || "");
  fd.append("goalAmount", String(payload.goalAmount ?? 0));
  fd.append("status", payload.status || "active");

  if (payload.imageUrl) fd.append("imageUrl", payload.imageUrl);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  return apiFetch("/campaigns", {
    method: "POST",
    body: fd,
  });
}

// PROTECTED: DELETE /campaigns/:id
export async function deleteCampaign(id: string): Promise<any> {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  return apiFetch(`/campaigns/${id.trim()}`, { method: "DELETE" });
}

export type UpdateCampaignPayload = Partial<{
  title: string;
  description: string;
  goalAmount: number;
  status: string;
  imageUrl: string; // allow set
  imageFile: File;
}>;

// PATCH /campaigns/:id (multipart/form-data)
export async function updateCampaign(
  id: string,
  payload: UpdateCampaignPayload
): Promise<Campaign> {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  const fd = new FormData();

  if (payload.title != null) fd.append("title", payload.title);
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.goalAmount != null) fd.append("goalAmount", String(payload.goalAmount));
  if (payload.status != null) fd.append("status", payload.status);

  if (payload.imageUrl != null) fd.append("imageUrl", payload.imageUrl);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  return apiFetch(`/campaigns/${id.trim()}`, {
    method: "PATCH",
    body: fd,
  });
}