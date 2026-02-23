const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
console.log("BASE_URL =", BASE_URL);

export async function apiFetch(path, options = {}) {
  // the debug here can be removed
  console.log("apiFetch ->", `${BASE_URL}${path}`);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = data?.error || data?.message || `Request failed (${resp.status})`;
    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}