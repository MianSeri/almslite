import { apiFetch } from "./clients";

// POST /auth/register
export async function registerNonprofit(payload) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /auth/login
export async function loginNonprofit(payload) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
