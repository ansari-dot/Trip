const PACKAGE_KEYWORDS = [
  "tour",
  "package",
  "packages",
  "trip",
  "price",
  "cost",
  "hunza",
  "skardu",
  "swat",
  "naran",
  "gilgit",
  "chitral",
  "fairy",
  "kaghan",
  "deosai",
  "vacation",
  "holiday",
];

const ITINERARY_KEYWORDS = [
  "itinerary",
  "plan my",
  "plan a",
  "day plan",
  "day trip",
  "what can i do",
  "things to do",
  "schedule",
  "suggest route",
];

export function detectIntent(message = "") {
  const text = message.toLowerCase();

  if (ITINERARY_KEYWORDS.some((k) => text.includes(k))) {
    return "itinerary";
  }

  if (PACKAGE_KEYWORDS.some((k) => text.includes(k))) {
    return "packages";
  }

  if (/^(hi|hello|salam|assalam|hey|aoa)\b/i.test(text.trim())) {
    return "greeting";
  }

  return "travel";
}
