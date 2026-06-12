import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Centralized model id. To upgrade the whole agent team to a more powerful
 * Gemini, just set GEMINI_MODEL in the environment (e.g. a newer flash/pro id).
 * Nothing else in the codebase needs to change.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 2048,
} as const;

/** Default team model (driven by GEMINI_MODEL). */
export const geminiFlash = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: GENERATION_CONFIG,
});

/** Build a model instance for a specific id (e.g. per-tier upgrades later). */
export function getGeminiModel(modelId: string = GEMINI_MODEL) {
  return genAI.getGenerativeModel({ model: modelId, generationConfig: GENERATION_CONFIG });
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface FileAttachment {
  data: string;     // base64-encoded file content
  mimeType: string; // "application/pdf", "image/jpeg", "image/png", etc.
  name: string;     // original filename for display
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
 * Stream une réponse Gemini, avec support multimodal optionnel (PDF / images).
 */
export async function* streamGeminiResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  attachments?: FileAttachment[]
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

  type Part =
    | { text: string }
    | { inlineData: { data: string; mimeType: string } };

  let messageInput: string | Part[];
  if (attachments?.length) {
    const parts: Part[] = attachments.map((att) => ({
      inlineData: { data: att.data, mimeType: att.mimeType },
    }));
    parts.push({ text: userMessage });
    messageInput = parts;
  } else {
    messageInput = userMessage;
  }

  const result = await chat.sendMessageStream(messageInput);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}