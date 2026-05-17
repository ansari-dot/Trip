/**
 * Allowed browser origins — configure via CLIENT_URL (comma-separated) on the VPS.
 * Optional DEV_ORIGINS for local npm run dev (only when NODE_ENV !== production).
 */
export function getCorsAllowedOrigins() {
  const clientUrl = (process.env.CLIENT_URL || "").trim();

  if (clientUrl === "*") {
    return "*";
  }

  const origins = new Set();

  if (clientUrl) {
    clientUrl
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean)
      .forEach((o) => origins.add(o));
  }

  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  extra.forEach((o) => origins.add(o));

  if (process.env.NODE_ENV !== "production") {
    const dev = (process.env.DEV_ORIGINS || "http://localhost:3000,http://localhost:3001")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean);
    dev.forEach((o) => origins.add(o));
  }

  return Array.from(origins);
}
