import type { MemoryEvent, MemoryKind } from "@/lib/types/tracking";

/**
 * Turns a project's memory timeline into a prompt block.
 *
 * Why a budget instead of injecting the whole history: the timeline only ever
 * grows. A project alive for six months would flood the context window, dilute
 * everything else in the prompt, and add cost to every single message. So we
 * keep what a good chief of staff would actually recall — the recent and the
 * structuring — and let the rest go.
 *
 * Ordering is by usefulness in conversation, not chronology: decisions first
 * (what the founder actually committed to), then risks, assumptions, milestones.
 */

/** Newest N kept per kind, before the character budget is applied. */
const PER_KIND_LIMIT: Record<MemoryKind, number> = {
  decision: 10,
  risk: 5,
  assumption: 5,
  milestone: 4,
};

/** Hard ceiling for the whole block, in characters (roughly 700 tokens). */
const CHAR_BUDGET = 2800;

const KIND_ORDER: MemoryKind[] = ["decision", "risk", "assumption", "milestone"];

const LABELS: Record<"fr" | "en", Record<MemoryKind, string>> = {
  fr: {
    decision: "Décisions prises",
    risk: "Risques identifiés",
    assumption: "Hypothèses posées",
    milestone: "Jalons franchis",
  },
  en: {
    decision: "Decisions made",
    risk: "Risks identified",
    assumption: "Assumptions stated",
    milestone: "Milestones reached",
  },
};

/**
 * "il y a 3 semaines" — dating what Mendly recalls is what makes the memory
 * feel real. "On avait décidé X" is a claim; "on avait décidé X il y a trois
 * semaines" is a memory.
 */
export function relativeAge(
  iso: string,
  locale: "fr" | "en",
  now: Date = new Date()
): string {
  const days = Math.max(
    0,
    Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000)
  );
  if (locale === "fr") {
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    if (days < 7) return `il y a ${days} jours`;
    if (days < 14) return "il y a une semaine";
    if (days < 31) return `il y a ${Math.round(days / 7)} semaines`;
    if (days < 60) return "il y a un mois";
    return `il y a ${Math.round(days / 30)} mois`;
  }
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "a week ago";
  if (days < 31) return `${Math.round(days / 7)} weeks ago`;
  if (days < 60) return "a month ago";
  return `${Math.round(days / 30)} months ago`;
}

/**
 * Selects the events worth recalling, newest first within each kind.
 * Exported so the autonomous team cron can reuse the exact same selection.
 */
export function selectMemoryForContext(events: MemoryEvent[]): MemoryEvent[] {
  const byKind = new Map<MemoryKind, MemoryEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  for (const event of sorted) {
    const bucket = byKind.get(event.kind) ?? [];
    if (bucket.length < PER_KIND_LIMIT[event.kind]) {
      bucket.push(event);
      byKind.set(event.kind, bucket);
    }
  }
  return KIND_ORDER.flatMap((kind) => byKind.get(kind) ?? []);
}

/**
 * Builds the prompt section. Returns "" when the project has no history yet,
 * so a brand-new project never carries an empty, confusing heading.
 */
export function buildProjectMemoryBlock(
  events: MemoryEvent[],
  locale: "fr" | "en",
  now: Date = new Date()
): string {
  const selected = selectMemoryForContext(events);
  if (selected.length === 0) return "";

  const lines: string[] = [];
  let used = 0;
  let lastKind: MemoryKind | null = null;

  for (const event of selected) {
    const heading = event.kind === lastKind ? null : `\n## ${LABELS[locale][event.kind]}`;
    const detail = event.detail?.trim();
    const line = `- ${event.title.trim()}${detail ? ` — ${detail}` : ""} (${relativeAge(
      event.created_at,
      locale,
      now
    )})`;
    const cost = line.length + (heading?.length ?? 0);
    // Stop cleanly rather than truncating mid-sentence: a half-quoted decision
    // Mendly would then misquote is worse than one it never saw.
    if (used + cost > CHAR_BUDGET) break;
    if (heading) lines.push(heading);
    lines.push(line);
    used += cost;
    lastKind = event.kind;
  }

  if (lines.length === 0) return "";

  const intro =
    locale === "fr"
      ? `\n\n# Mémoire du projet\nCe qui a été décidé, craint, supposé et accompli avant aujourd'hui. Tu t'en souviens réellement : cite ces éléments nommément et avec leur ancienneté quand c'est pertinent ("on avait tranché ça il y a trois semaines"). Ne les récite jamais en bloc, et ne fais pas semblant de te souvenir de ce qui n'est pas listé ici.`
      : `\n\n# Project memory\nWhat was decided, feared, assumed and achieved before today. You genuinely remember this: cite these by name and by age when relevant ("we settled that three weeks ago"). Never recite them as a list, and never pretend to remember anything not listed here.`;

  return `${intro}\n${lines.join("\n")}`;
}
