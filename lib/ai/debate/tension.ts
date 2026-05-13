import { geminiFlash } from "@/lib/ai/gemini";
import type { DebateAgentRole, TensionLink } from "@/lib/types/debate";

export async function analyzeTension(
  thread: { agent: string; content: string }[],
  agents: DebateAgentRole[],
  locale: "fr" | "en"
): Promise<TensionLink[]> {
  if (agents.length < 2) return [];

  const threadStr = thread.map((t) => `${t.agent}: ${t.content.slice(0, 100)}`).join("\n");

  const pairs: string[] = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      pairs.push(`${agents[i]}-${agents[j]}`);
    }
  }

  const prompt =
    locale === "en"
      ? `Analyze conflict intensity between debaters:

${threadStr}

Rate each pair: 1=slight disagreement, 2=clear opposition, 3=strong clash.
Pairs: ${pairs.join(", ")}

JSON only — no text: [{"a":"X","b":"Y","intensity":N}]
Omit pairs with no conflict. Max 3 entries total.`
      : `Analyse l'intensité des conflits entre participants :

${threadStr}

Note chaque paire : 1=léger désaccord, 2=opposition claire, 3=clash fort.
Paires : ${pairs.join(", ")}

JSON uniquement — sans texte : [{"a":"X","b":"Y","intensity":N}]
Omets les paires sans conflit. Maximum 3 entrées au total.`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const raw = result.response.text();
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      a: string;
      b: string;
      intensity: number;
    }[];
    return parsed
      .filter(
        (e) =>
          agents.includes(e.a as DebateAgentRole) &&
          agents.includes(e.b as DebateAgentRole) &&
          e.intensity >= 1 &&
          e.intensity <= 3
      )
      .slice(0, 6)
      .map((e) => ({
        a: e.a as DebateAgentRole,
        b: e.b as DebateAgentRole,
        intensity: e.intensity as 1 | 2 | 3,
      }));
  } catch {
    return [];
  }
}
