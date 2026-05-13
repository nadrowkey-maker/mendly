import { geminiFlash } from "@/lib/ai/gemini";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole, VoteVerdict } from "@/lib/types/debate";

interface ConsensusInput {
  agent: DebateAgentRole;
  question: string;
  ceoCall: string;
  thread: { agent: string; content: string }[];
  project: Project;
  locale: "fr" | "en";
}

export function parseVote(raw: string): { verdict: VoteVerdict; note: string } {
  const text = raw.trim();
  const pipeIdx = text.indexOf("|");
  if (pipeIdx === -1) {
    const upper = text.toUpperCase();
    if (upper.includes("DISAGREE")) return { verdict: "disagree", note: "" };
    if (upper.includes("RELUCTANT")) return { verdict: "reluctant", note: "" };
    return { verdict: "agree", note: "" };
  }
  const rawVerdict = text.slice(0, pipeIdx).trim().toUpperCase();
  const note = text.slice(pipeIdx + 1).trim().slice(0, 120);
  const map: Record<string, VoteVerdict> = {
    AGREE: "agree",
    RELUCTANT: "reluctant",
    DISAGREE: "disagree",
  };
  return { verdict: map[rawVerdict] ?? "agree", note };
}

export async function generateConsensusVote(
  input: ConsensusInput
): Promise<{ verdict: VoteVerdict; note: string }> {
  const { agent, question, ceoCall, thread, locale } = input;
  const agentTurns = thread
    .filter((t) => t.agent === agent)
    .map((t) => t.content.slice(0, 100))
    .join(" / ");

  const prompt =
    locale === "en"
      ? `You are the ${agent}. CEO just decided on "${question}":
"${ceoCall.slice(0, 250)}"

Your positions in the debate: "${agentTurns.slice(0, 150)}"

Secret ballot — no one else sees this:
AGREE = you support it | RELUCTANT = you accept but have concerns | DISAGREE = you think it's wrong

Reply EXACTLY: VERDICT|One sentence max (15 words) of your private reaction.
Examples:
AGREE|Finally the right call.
RELUCTANT|I'll accept it, but the timeline will bite us.
DISAGREE|He ignored everything I said about unit economics.`
      : `Tu es le ${agent}. Le CEO vient de décider sur "${question}" :
"${ceoCall.slice(0, 250)}"

Tes positions dans le débat : "${agentTurns.slice(0, 150)}"

Vote secret — personne d'autre ne le voit :
AGREE = tu soutiens | RELUCTANT = tu acceptes avec réserves | DISAGREE = tu penses que c'est une erreur

Réponds EXACTEMENT : VERDICT|Une phrase max (15 mots) de ta réaction privée.
Exemples :
AGREE|Enfin la bonne décision.
RELUCTANT|Je l'accepte, mais ce délai va nous coûter.
DISAGREE|Il a ignoré tout ce que j'ai dit sur les chiffres.`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    return parseVote(result.response.text());
  } catch {
    return { verdict: "agree", note: "" };
  }
}
