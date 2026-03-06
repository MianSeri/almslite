const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
console.log("BASE_URL =", BASE_URL);

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http")
  ? path
  : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  if (import.meta.env.DEV) console.log("apiFetch ->", url);

  const token = localStorage.getItem("token");

  // Use Headers so we can conditionally set Content-Type
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;

  // Only set JSON header if NOT sending FormData
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resp = await fetch(url, {
    ...options,
    headers,
  });

  // Handle JSON or non-JSON responses safely
  const contentType = resp.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await resp.json().catch(() => ({}))
    : await resp.text().catch(() => "");

  if (!resp.ok) {
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${resp.status})`;

    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}