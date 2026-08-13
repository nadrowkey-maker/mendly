import {
  callWithRetry,
  extractJson,
  sanitizeAgents,
  SPECIALIST_DESC,
  VALID_AGENTS,
} from "@/lib/ai/debate/selector";
import type { AgentSelection, DebateAgentRole } from "@/lib/types/debate";

interface AssignTeamInput {
  name: string;
  description: string | null;
  stage: string;
  sector: string | null;
  locale: "fr" | "en";
  /** Plan-based ceiling on team size (PLANS[plan].teamSize). */
  maxAgents: number;
}

/**
 * Runs once, at project creation — Mendly reads the project description and
 * assembles the permanent specialist team for it (persisted on the project,
 * see 0003_project_team.sql). Unlike selectAgents() in lib/ai/debate/selector.ts
 * (which picks 2-4 agents per debate question), this picks a team sized to the
 * project itself, and only as many specialists as genuinely apply — a
 * dropshipping project doesn't need the same team as a solo SaaS founder.
 */
export async function assignProjectTeam(input: AssignTeamInput): Promise<AgentSelection> {
  const maxPick = Math.min(Math.max(input.maxAgents, 2), VALID_AGENTS.length);

  const fallback: AgentSelection = {
    agents: VALID_AGENTS.slice(0, maxPick),
    rationale: input.locale === "en" ? "Default balanced team." : "Équipe équilibrée par défaut.",
  };

  try {
    const result = await callWithRetry(buildPrompt(input, maxPick));
    if (!result) return fallback;
    const raw = result.response.text();
    if (!raw) return fallback;

    const parsed = JSON.parse(extractJson(raw)) as { agents?: unknown; rationale?: unknown };
    const agents = sanitizeAgents(parsed.agents, VALID_AGENTS, maxPick);
    if (agents.length < Math.min(2, maxPick)) return fallback;

    const rationale =
      typeof parsed.rationale === "string" && parsed.rationale.trim()
        ? parsed.rationale.trim().slice(0, 200)
        : fallback.rationale;

    return { agents, rationale };
  } catch (err) {
    console.error("[assign-team]", err);
    return fallback;
  }
}

function buildPrompt(input: AssignTeamInput, maxPick: number): string {
  const specialists = VALID_AGENTS.map((a: DebateAgentRole) => `- ${SPECIALIST_DESC[a]}`).join("\n");

  if (input.locale === "en") {
    return `You are Mendly, assembling a PERMANENT team of specialists for a founder's new project. This team stays attached to the project for all future team debates — choose carefully.

Project: ${input.name} | Stage: ${input.stage} | Sector: ${input.sector ?? "N/A"}
Description: ${input.description ?? "(none)"}

Available specialists:
${specialists}

Pick between 2 and ${maxPick} specialists — only those genuinely relevant to THIS project's real needs. Skip roles that clearly don't apply (e.g. no DEV for a no-code project, no CTO for a pure content business). Don't pad the count just to reach the max.

Respond ONLY with valid JSON (no markdown, no commentary):
{"agents":["XXX","XXX"],"rationale":"Brief explanation in English (max 120 chars)"}`;
  }

  return `Tu es Mendly, tu assembles une équipe PERMANENTE de spécialistes pour le nouveau projet d'un fondateur. Cette équipe reste attachée au projet pour tous ses futurs débats — choisis avec soin.

Projet : ${input.name} | Stade : ${input.stage} | Secteur : ${input.sector ?? "N/A"}
Description : ${input.description ?? "(aucune)"}

Spécialistes disponibles :
${specialists}

Choisis entre 2 et ${maxPick} spécialistes — seulement ceux réellement pertinents pour les besoins réels DE CE projet. Écarte les rôles qui ne s'appliquent clairement pas (ex : pas de DEV pour un projet no-code, pas de CTO pour un business de pur contenu). Ne remplis pas le quota juste pour l'atteindre.

Réponds UNIQUEMENT avec du JSON valide (pas de markdown, pas d'explication) :
{"agents":["XXX","XXX"],"rationale":"Explication courte en français (max 120 caractères)"}`;
}
