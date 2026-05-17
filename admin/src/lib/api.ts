export const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function getApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
