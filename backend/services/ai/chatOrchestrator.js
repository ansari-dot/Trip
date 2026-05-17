import { detectIntent } from "./intentDetector.js";
import {
  findMatchingPackages,
  formatPackagesForPrompt,
  toPackageSummary,
} from "./packageMatcher.js";
import { detectLocationInMessage, getWeatherSnippet } from "./weatherHelper.js";
import { buildChatMessages } from "./promptBuilder.js";
import { completeChat } from "./groqClient.js";
import { isAllowedTopic, OFF_TOPIC_REPLY } from "./topicGuard.js";

export async function runTripPlannerChat({ message, messages = [], siteBaseUrl = "" }) {
  const userMessage = String(message || "").trim();
  if (!userMessage) {
    const err = new Error("Message is required");
    err.statusCode = 400;
    throw err;
  }

  if (userMessage.length > 2000) {
    const err = new Error("Message is too long");
    err.statusCode = 400;
    throw err;
  }

  if (!isAllowedTopic(userMessage, messages)) {
    return {
      reply: OFF_TOPIC_REPLY,
      intent: "off_topic",
      matchedPackages: [],
      weatherUsed: false,
    };
  }

  const intent = detectIntent(userMessage);
  const needsPackages = ["packages", "itinerary", "greeting", "travel"].includes(intent);

  const matchedPackages = needsPackages
    ? await findMatchingPackages(userMessage, intent === "packages" ? 8 : 6)
    : [];

  const packagesText = formatPackagesForPrompt(matchedPackages);
  const location = detectLocationInMessage(userMessage);
  const weatherText = await getWeatherSnippet(location);

  const groqMessages = buildChatMessages({
    userMessage,
    clientMessages: messages,
    intent,
    packagesText,
    weatherText,
    siteBaseUrl,
  });

  const reply = await completeChat(groqMessages);

  return {
    reply,
    intent,
    matchedPackages: matchedPackages.map(toPackageSummary),
    weatherUsed: Boolean(weatherText),
  };
}
