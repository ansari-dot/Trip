/** Pakistan tour destinations & places we sell trips to */
const DESTINATION_TERMS = [
  "hunza",
  "skardu",
  "swat",
  "naran",
  "gilgit",
  "chitral",
  "fairy",
  "kaghan",
  "deosai",
  "attabad",
  "khunjerab",
  "passu",
  "shigar",
  "astore",
  "babusar",
  "kalam",
  "murree",
  "islamabad",
  "lahore",
  "karachi",
  "northern pakistan",
  "gilgit baltistan",
  "karakoram",
];

/** Words that mean the user is asking about OUR tours / trip planning */
const TRAVEL_TERMS = [
  "tour",
  "tours",
  "package",
  "packages",
  "trip",
  "trips",
  "travel",
  "visit",
  "vacation",
  "holiday",
  "itinerary",
  "destination",
  "destinations",
  "price",
  "cost",
  "budget",
  "days",
  "night",
  "family",
  "adventure",
  "honeymoon",
  "group",
  "quote",
  "booking",
  "book",
  "north paradise",
  "treks",
  "trek",
  "safari",
  "jeep",
  "accommodation",
  "hotel",
  "guide",
  "flight",
  "ticketing",
  "rent",
  "vehicle",
  "weather",
  "best time",
  "season",
  "things to do",
  "plan my",
  "plan a",
  "suggest",
  "recommend",
  "available",
  "include",
  "highlights",
];

/** Clear non-travel topics — never answer these */
const OFF_TOPIC_TERMS = [
  "python",
  "javascript",
  "coding",
  "programming",
  "react",
  "html",
  "css",
  "api key",
  "crypto",
  "bitcoin",
  "stock",
  "forex",
  "recipe",
  "cooking",
  "dating",
  "relationship",
  "homework",
  "essay",
  "assignment",
  "exam",
  "politics",
  "election",
  "president",
  "war",
  "religion debate",
  "joke",
  "poem",
  "story write",
  "translate this",
  "math problem",
  "solve this",
  "who won",
  "celebrity",
  "movie",
  "netflix",
  "game",
  "fortnite",
  "minecraft",
  "iphone",
  "android fix",
  "doctor",
  "medicine",
  "symptom",
  "disease",
  "legal advice",
  "lawyer",
  "visa usa",
  "visa uk",
  "visa canada",
  "europe tour",
  "dubai trip",
  "turkey package",
  "thailand",
  "maldives",
];

const GREETING_RE = /^(hi|hello|hey|salam|assalam|aoa|good morning|good evening|thanks|thank you|ok|okay)\b/i;

const SHORT_FOLLOWUP_RE =
  /^(yes|no|sure|ok|okay|please|tell me more|more info|which one|that one|sounds good|\d+\s*(days?|people|persons?|pax|pkf|rs|rupees?)?)\b/i;

/** e.g. "five day trip", "7 days in Hunza", "3 night package skardu" */
const TRIP_PLAN_RE =
  /\b\d+\s*(?:-| )?(?:day|days|night|nights)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:day|days|night|nights)\b/i;

export const OFF_TOPIC_REPLY = `I'm the North Paradise tour advisor — I only help with:

• Our tour packages on this website
• Northern Pakistan trips (Hunza, Skardu, Swat, Naran, Gilgit, etc.)
• Itineraries, prices, and trip planning with our team

I can't answer other topics. Ask about a tour or destination, or use Tour Packages / Request Quote on the site.`;

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isClearlyOffTopic(text) {
  const t = normalize(text);
  if (!t) return true;
  return OFF_TOPIC_TERMS.some((term) => t.includes(term));
}

export function isClearlyTravel(text) {
  const t = normalize(text);
  if (!t) return false;

  if (GREETING_RE.test(t)) return true;

  const travelHit =
    TRAVEL_TERMS.some((term) => t.includes(term)) ||
    DESTINATION_TERMS.some((term) => t.includes(term)) ||
    TRIP_PLAN_RE.test(t);

  return travelHit;
}

function recentTravelContext(clientMessages = []) {
  const userLines = clientMessages
    .filter((m) => m?.role === "user" && m?.content)
    .slice(-4)
    .map((m) => normalize(m.content));

  return userLines.some((line) => isClearlyTravel(line) && !isClearlyOffTopic(line));
}

/**
 * Strict: only allow Groq when message is about our tours / Northern Pakistan travel.
 */
export function isAllowedTopic(message, clientMessages = []) {
  const text = String(message || "").trim();
  if (!text) return false;

  if (isClearlyOffTopic(text)) return false;

  if (isClearlyTravel(text)) return true;

  if (SHORT_FOLLOWUP_RE.test(normalize(text)) && recentTravelContext(clientMessages)) {
    return true;
  }

  return false;
}
