/**
 * API base URL — set VITE_API_URL in .env (required for local dev; production VPS build).
 * Leave empty only if the frontend is served from the same origin that proxies /api to the backend.
 */
export const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function getApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
