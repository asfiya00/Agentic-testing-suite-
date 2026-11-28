import { GoogleGenAI } from "@google/genai";

const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

export async function askLLM(prompt, { json = false } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastErr;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: json ? { responseMimeType: "application/json" } : undefined,
        });
        return response.text;
      } catch (err) {
  lastErr = err;
  const retryable = err.status === 503 || err.status === 429 || err.message?.includes("fetch failed");
  if (err.status === 404) break;
  if (!retryable) throw err;
  await new Promise((r) => setTimeout(r, 2000 * attempt));
}
    }
  }
  throw lastErr;
}