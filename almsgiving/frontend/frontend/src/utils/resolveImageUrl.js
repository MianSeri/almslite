const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export function resolveImageUrl(url) {
  if (!url) return "";

  const s = String(url).trim();
  if (!s) return "";

  // already absolute
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // serve backend uploads like /uploads/abc.jpg
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;

  // any other relative path (rare)
  if (s.startsWith("/")) return `${API_BASE}${s}`;

  return s;
}