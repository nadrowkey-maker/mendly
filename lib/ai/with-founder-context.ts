import type { UserProfile } from "@/lib/types/profile";
import { buildFounderBrief } from "@/lib/types/profile";

/**
 * Prepends the founder brief (if any) to a system prompt.
 *
 * Why a wrapper instead of editing each prompt: keeps the existing 8 agent
 * prompts untouched, and lets us turn injection on/off in one place if needed.
 *
 * The brief is added BEFORE the original prompt so the agent's identity
 * remains the dominant frame, but it picks up the founder context for tone
 * and depth calibration.
 */
export function withFounderContext(
  systemPrompt: string,
  profile: UserProfile | null,
  locale: "fr" | "en"
): string {
  const brief = buildFounderBrief(profile, locale);
  if (!brief) return systemPrompt;
  return `${brief}\n\n---\n\n${systemPrompt}`;
}
