/**
 * Public base URL for uploads and links (set on VPS via PUBLIC_URL).
 * Example: https://northparadisetreksandtours.com or https://api.yourdomain.com
 */
export function getPublicBaseUrl(req) {
  const fromEnv = (process.env.PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || "").trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (req) {
    return `${req.protocol}://${req.get("host")}`.replace(/\/$/, "");
  }
  return "";
}

export function buildUploadUrl(req, fileName) {
  if (!fileName) return "";
  const base = getPublicBaseUrl(req);
  return `${base}/uploads/${fileName}`;
}

export function getClientSiteUrl(req) {
  const fromEnv = (process.env.CLIENT_SITE_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const clientUrl = (process.env.CLIENT_URL || "").trim();
  if (clientUrl && clientUrl !== "*") {
    const first = clientUrl.split(",")[0]?.trim();
    if (first) return first.replace(/\/$/, "");
  }

  if (req?.get?.("origin")) {
    return req.get("origin").replace(/\/$/, "");
  }

  return getPublicBaseUrl(req);
}
