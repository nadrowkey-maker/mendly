"use server";

import { geminiFlash } from "@/lib/ai/gemini";
import { recordDebate } from "@/lib/actions/debates";
import { createAction } from "@/lib/actions/actions";
import { createMemoryEvent } from "@/lib/actions/memory";
import { track } from "@/lib/actions/analytics";

/**
 * After a debate ends, record it and turn the CEO verdict into durable state:
 * the decision lands in project memory, and the next actions become tracked,
 * checkable items (Bloc 2 + 3.2). Best-effort — never throws to the caller.
 */
export async function harvestVerdict(input: {
  projectId: string;
  conversationId?: string | null;
  question: string;
  verdict: string;
  agents?: string[];
}): Promise<{ success: boolean }> {
  await recordDebate({
    projectId: input.projectId,
    conversationId: input.conversationId ?? null,
    question: input.question,
    verdict: input.verdict,
    agents: input.agents,
  });
  void track("debate_completed", { agents: input.agents?.length ?? 0 });

  try {
    const prompt = `From the CEO decision below, extract the single final decision (one short sentence) and the concrete next actions (max 3, imperative, short).
Reply with STRICT JSON only, no prose, no code fences:
{"decision": "string", "actions": ["string", "string"]}

CEO DECISION:
"""${input.verdict.slice(0, 3000)}"""`;

    const res = await geminiFlash.generateContent(prompt);
    let text = res.response.text().trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(text) as { decision?: string; actions?: string[] };

    if (parsed.decision && parsed.decision.trim()) {
      await createMemoryEvent({
        projectId: input.projectId,
        kind: "decision",
        title: parsed.decision.trim().slice(0, 300),
      });
    }
    if (Array.isArray(parsed.actions)) {
      for (const a of parsed.actions.slice(0, 3)) {
        if (typeof a === "string" && a.trim()) {
          await createAction({
            projectId: input.projectId,
            content: a.trim().slice(0, 300),
            source: "ceo",
            conversationId: input.conversationId ?? null,
          });
        }
      }
    }
  } catch (e) {
    console.warn("harvestVerdict extraction skipped:", e);
  }

  return { success: true };
}
