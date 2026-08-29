import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

/**
 * Centralized model id. To upgrade the whole product to a more capable Gemini,
 * just set GEMINI_MODEL in the environment. Nothing else in the codebase needs
 * to change.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 2048,
} as const;

/**
 * Le client est construit à la première utilisation réelle, pas au chargement
 * du module.
 *
 * Avant, l'absence de GEMINI_API_KEY levait une erreur à l'import : n'importe
 * quelle page qui importait, même indirectement, un fichier touchant à l'IA
 * tombait en 500 — le tableau de bord par exemple, qui ne demande pourtant
 * jamais rien au modèle au chargement. Une clé manquante doit casser les appels
 * à l'IA, pas des écrans qui n'en font pas.
 */
let cachedClient: GoogleGenerativeAI | null = null;

function client(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  cachedClient ??= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return cachedClient;
}

/** Build a model instance for a specific id (e.g. per-tier upgrades later). */
export function getGeminiModel(modelId: string = GEMINI_MODEL): GenerativeModel {
  return client().getGenerativeModel({ model: modelId, generationConfig: GENERATION_CONFIG });
}

/**
 * Modèle par défaut. Exposé via un proxy pour garder la forme d'appel
 * historique (`geminiFlash.generateContent(...)`) tout en repoussant la
 * construction du client au premier accès.
 */
export const geminiFlash: GenerativeModel = new Proxy({} as GenerativeModel, {
  get(_target, prop, receiver) {
    const model = getGeminiModel();
    const value = Reflect.get(model, prop, receiver);
    return typeof value === "function" ? value.bind(model) : value;
  },
});

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