import { geminiFlash } from "@/lib/ai/gemini";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

interface WhisperInput {
  agent: DebateAgentRole;
  question: string;
  agentTurnContent: string;
  previousTurns: { agent: string; content: string }[];
  project: Project;
  locale: "fr" | "en";
}

export async function generateWhisper(input: WhisperInput): Promise<string | null> {
  const { agent, question, agentTurnContent, previousTurns, locale } = input;
  const threadStr = previousTurns.map((t) => `${t.agent}: ${t.content.slice(0, 80)}`).join("\n");

  const prompt =
    locale === "en"
      ? `You are the ${agent} in a board debate on "${question}".

You just said publicly:
"${agentTurnContent.slice(0, 200)}"

Thread so far:
${threadStr}

Write 1-2 sentences as a PRIVATE note to the CEO — something you'd say off the record, not in front of the others.
Sharp, specific, honest. 40 words max.
If you have nothing genuinely private to add: SKIP`
      : `Tu es le ${agent} dans un débat sur "${question}".

Tu viens de dire publiquement :
"${agentTurnContent.slice(0, 200)}"

Le fil du débat :
${threadStr}

Écris 1-2 phrases en MESSAGE PRIVÉ au CEO — quelque chose que tu dirais hors micro, pas devant les autres.
Précis, tranchant, honnête. 40 mots max.
Si tu n'as rien de vraiment privé à ajouter : SKIP`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text || text.toUpperCase().startsWith("SKIP") || text.length < 10) return null;
    return text.slice(0, 300);
  } catch {
    return null;
  }
}
