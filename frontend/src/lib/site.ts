/** Public marketing site URL (canonical links, SEO). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");

/** WhatsApp business number without + (digits only). */
export const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || "923488142776"
).replace(/\D/g, "");

export function whatsAppUrl(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Human-readable display, e.g. +92 348 8142776 */
export function formatPhoneDisplay() {
  const n = WHATSAPP_NUMBER;
  if (n.length === 12 && n.startsWith("92")) {
    return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
  }
  return n.startsWith("+") ? n : `+${n}`;
}

export function telUrl() {
  return `tel:+${WHATSAPP_NUMBER}`;
}
