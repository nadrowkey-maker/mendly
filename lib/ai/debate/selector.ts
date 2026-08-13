import { geminiFlash } from "@/lib/ai/gemini";
import type { Project } from "@/lib/types/project";
import type { AgentSelection, DebateAgentRole } from "@/lib/types/debate";

export const VALID_AGENTS: DebateAgentRole[] = ["CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"];

export const SPECIALIST_DESC: Record<DebateAgentRole, string> = {
  CTO: "CTO: Tech architecture, stack, technical risks",
  CMO: "CMO: Marketing, positioning, growth, brand",
  CPO: "CPO: Product strategy, prioritization, user stories",
  CFO: "CFO: Finance, pricing, fundraising, unit economics",
  CDO: "CDO: Data, metrics, analytics, KPIs",
  DEV: "DEV: Concrete coding, implementation",
  CCO: "CCO: Communication, copy, content, PR",
};

interface SelectorInput {
  question: string;
  project: Project;
  locale: "fr" | "en";
  /** Restrict selectable agents (e.g. to the founder's plan). CEO excluded. */
  allowed?: DebateAgentRole[];
}

export async function callWithRetry(prompt: string) {
  for (let i = 1; i <= 3; i++) {
    try {
      return await geminiFlash.generateContent(prompt);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || status === 503) && i < 3) {
        const details = (err as { errorDetails?: { "@type"?: string; retryDelay?: string }[] })?.errorDetails;
        let delay = status === 429 ? 20_000 : 2000 * i;
        if (Array.isArray(details)) {
          for (const d of details) {
            if (d["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && d.retryDelay) {
              const s = parseFloat(d.retryDelay);
              if (!isNaN(s)) { delay = Math.min(s * 1000, 30_000); break; }
            }
          }
        }
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

export async function selectAgents(input: SelectorInput): Promise<AgentSelection> {
  const pool =
    input.allowed && input.allowed.length >= 2
      ? input.allowed.filter((a) => VALID_AGENTS.includes(a))
      : VALID_AGENTS;

  const fallback: AgentSelection = {
    agents: pool.slice(0, 2),
    rationale:
      input.locale === "en"
        ? "Default balanced perspective."
        : "Perspective équilibrée par défaut.",
  };

  try {
    const result = await callWithRetry(buildPrompt(input, pool));
    if (!result) return fallback;
    const raw = result.response.text();
    if (!raw) return fallback;

    const jsonStr = extractJson(raw);
    const parsed = JSON.parse(jsonStr) as { agents?: unknown; rationale?: unknown };
    const agents = sanitizeAgents(parsed.agents, pool);
    if (agents.length < 2) return fallback;

    const rationale =
      typeof parsed.rationale === "string" && parsed.rationale.trim()
        ? parsed.rationale.trim().slice(0, 200)
        : input.locale === "en"
          ? "Selected based on question relevance."
          : "Sélectionnés selon la pertinence de la question.";

    return { agents, rationale };
  } catch (err) {
    console.error("[selector]", err);
    return fallback;
  }
}

function buildPrompt({ question, project, locale }: SelectorInput, pool: DebateAgentRole[]): string {
  const specialists = pool.map((a) => `- ${SPECIALIST_DESC[a]}`).join("\n");
  const maxPick = Math.min(4, pool.length);

  if (locale === "en") {
    return `You are a CEO selecting debate participants for a founder's question.

Question: "${question}"
Project: ${project.name} | Stage: ${project.stage} | Sector: ${project.sector ?? "N/A"}
Description: ${project.description ?? "(none)"}

Available specialists (CEO excluded):
${specialists}

Select 2–${maxPick} specialists with the most distinct, relevant perspectives.
2 is fine for focused questions. ${maxPick} max for broad multi-faceted ones.

Respond ONLY with valid JSON (no markdown, no commentary):
{"agents":["XXX","XXX"],"rationale":"Brief explanation in English (max 100 chars)"}`;
  }

  return `Tu es le CEO qui sélectionne les participants d'un débat.

Question : "${question}"
Projet : ${project.name} | Stade : ${project.stage} | Secteur : ${project.sector ?? "N/A"}
Description : ${project.description ?? "(aucune)"}

Spécialistes disponibles (CEO exclu) :
${specialists}

Sélectionne 2–${maxPick} spécialistes avec les perspectives les plus distinctes et pertinentes.
2 suffit pour une question précise. ${maxPick} max pour les questions larges.

Réponds UNIQUEMENT avec du JSON valide (pas de markdown, pas d'explication) :
{"agents":["XXX","XXX"],"rationale":"Explication courte en français (max 100 chars)"}`;
}

export function sanitizeAgents(
  input: unknown,
  pool: DebateAgentRole[],
  limit = 4
): DebateAgentRole[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.toUpperCase().trim() as DebateAgentRole)
        .filter((x): x is DebateAgentRole => pool.includes(x))
    )
  ).slice(0, limit);
}

export function extractJson(text: string): string {
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) return stripped;
  return stripped.slice(start, end + 1);
}
