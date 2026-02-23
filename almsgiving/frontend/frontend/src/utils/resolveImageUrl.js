const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/")) return `${API_BASE}${imageUrl}`;
  return imageUrl;
}