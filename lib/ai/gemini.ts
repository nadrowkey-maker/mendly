import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Modèle Gemini Flash (rapide + gratuit dans les limites)
 */
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/**
 * Convertit notre format de messages en format Gemini.
 * Gemini utilise "user" et "model" (pas "assistant").
 */
export function toGeminiHistory(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): ChatMessage[] {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      content: m.content,
    }));
}

/**
 * Stream une réponse Gemini.
 * @param systemPrompt Le prompt système (instructions de l'agent)
 * @param history L'historique de la conversation
 * @param userMessage Le nouveau message du user
 * @returns Un AsyncGenerator qui yield les chunks de texte
 */
export async function* streamGeminiResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  const chat = geminiFlash.startChat({
    history: history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    systemInstruction: {
      role: "system",
      parts: [{ text: systemPrompt }],
    },
  });

  const result = await chat.sendMessageStream(userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}