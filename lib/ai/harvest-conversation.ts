import { geminiFlash } from "@/lib/ai/gemini";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Extracts decisions from an ordinary conversation with Mendly.
 *
 * Why this exists: decisions were only ever recorded at the end of a team
 * debate (harvestVerdict). A founder who simply talks things through with
 * Mendly and settles on something left no trace — so project memory stayed
 * blind to it, and the 30-day cold debrief had nothing to trigger on.
 *
 * Deliberately NOT run on every message. One extraction per exchange would
 * double the model calls of the whole product and, worse, would keep asking
 * "was anything decided?" after two lines of small talk — producing confident
 * non-decisions that then pollute the memory block. We harvest on a cadence,
 * over a window of recent messages.
 *
 * Records the decision only, never actions: silently turning a casual
 * conversation into checkable to-do items is intrusive. Actions stay tied to
 * an explicit team debate.
 */

/** One extraction every N assistant replies in a conversation. */
export const HARVEST_EVERY = 5;

/** How many recent messages the extractor gets to look at. */
const WINDOW = 12;

export function shouldHarvest(assistantReplyCount: number): boolean {
  return assistantReplyCount > 0 && assistantReplyCount % HARVEST_EVERY === 0;
}

/** Loose comparison so a rephrased duplicate does not enter memory twice. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isDuplicate(candidate: string, existing: string[]): boolean {
  const c = normalize(candidate);
  if (!c) return true;
  return existing.some((e) => {
    const n = normalize(e);
    return n === c || n.includes(c) || c.includes(n);
  });
}

export async function harvestConversationDecision(input: {
  projectId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  locale: "fr" | "en";
}): Promise<{ recorded: boolean; reason?: string }> {
  try {
    const window = input.transcript.slice(-WINDOW);
    if (window.length < 4) return { recorded: false, reason: "too_short" };

    const dialogue = window
      .map((m) => `${m.role === "user" ? "FOUNDER" : "MENDLY"}: ${m.content.slice(0, 1200)}`)
      .join("\n\n");

    // The escape hatch matters more than the extraction: most conversations
    // settle nothing, and a model that must always answer will invent.
    const prompt = `Read this conversation between a founder and their advisor.

Was a REAL decision settled — something the founder committed to doing or not doing? A hypothesis, an idea floated, or advice given is NOT a decision.

If yes, state it in one short sentence, in ${input.locale === "fr" ? "French" : "English"}, from the founder's point of view.
If nothing was actually settled, return null. Returning null is the expected answer most of the time.

Reply with STRICT JSON only, no prose, no code fences:
{"decision": "string or null"}

CONVERSATION:
"""${dialogue}"""`;

    const res = await geminiFlash.generateContent(prompt);
    let text = res.response.text().trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(text) as { decision?: string | null };

    const decision = typeof parsed.decision === "string" ? parsed.decision.trim() : "";
    if (!decision || decision.toLowerCase() === "null") {
      return { recorded: false, reason: "no_decision" };
    }

    // Admin client on purpose: this runs in after(), past the response, where
    // relying on the request's cookie session would be fragile.
    const supabase = createAdminClient();

    const { data: previous } = await supabase
      .from("memory_events")
      .select("title")
      .eq("project_id", input.projectId)
      .eq("kind", "decision")
      .order("created_at", { ascending: false })
      .limit(30);

    const titles = ((previous ?? []) as { title: string }[]).map((r) => r.title);
    if (isDuplicate(decision, titles)) return { recorded: false, reason: "duplicate" };

    const { error } = await supabase.from("memory_events").insert({
      project_id: input.projectId,
      user_id: input.userId,
      kind: "decision",
      title: decision.slice(0, 300),
      detail: null,
    });
    if (error) {
      console.warn("harvestConversationDecision insert failed:", error.message);
      return { recorded: false, reason: "insert_failed" };
    }

    return { recorded: true };
  } catch (e) {
    // Never surfaces to the founder: a failed harvest must not affect the chat.
    console.warn("harvestConversationDecision skipped:", e);
    return { recorded: false, reason: "error" };
  }
}
