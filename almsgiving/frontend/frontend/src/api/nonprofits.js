import { apiFetch } from "./clients";

export function deleteMyNonprofit() {
  return apiFetch("/nonprofits/me", { method: "DELETE" });
}