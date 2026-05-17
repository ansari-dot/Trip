const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

export async function completeChat(messages) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const err = new Error("AI service is not configured. Set GROQ_API_KEY on the server.");
    err.statusCode = 503;
    throw err;
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      messages,
      temperature: 0.45,
      max_tokens: 900,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data?.error?.message || "AI request failed");
    err.statusCode = response.status === 429 ? 429 : 502;
    throw err;
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    const err = new Error("Empty AI response");
    err.statusCode = 502;
    throw err;
  }

  return reply;
}
