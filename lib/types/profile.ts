export type FounderExpertise = "tech" | "business" | "design" | "marketing" | "mixed" | "none";
export type FounderTime = "weekend" | "parttime" | "fulltime";
export type FounderStage = "first_time" | "second_time" | "experienced";

export interface UserProfile {
  user_id: string;
  founder_context: string | null;
  expertise: FounderExpertise | null;
  goals: string | null;
  time_commitment: FounderTime | null;
  stage: FounderStage | null;
  onboarding_completed: boolean;
  onboarding_skipped: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingInput {
  founder_context: string;
  expertise: FounderExpertise;
  goals: string;
  time_commitment: FounderTime;
  stage: FounderStage;
}

/**
 * Compact representation of the founder, injected into agent system prompts.
 * Returns null if no useful context is set.
 */
export function buildFounderBrief(profile: UserProfile | null, locale: "fr" | "en"): string | null {
  if (!profile) return null;
  const hasAny =
    profile.founder_context ||
    profile.expertise ||
    profile.goals ||
    profile.time_commitment ||
    profile.stage;
  if (!hasAny) return null;

  const expertiseMap: Record<FounderExpertise, { fr: string; en: string }> = {
    tech: { fr: "tech / dev", en: "tech / dev" },
    business: { fr: "business / ops", en: "business / ops" },
    design: { fr: "design / produit", en: "design / product" },
    marketing: { fr: "marketing / growth", en: "marketing / growth" },
    mixed: { fr: "polyvalent", en: "generalist" },
    none: { fr: "débutant", en: "beginner" },
  };

  const stageMap: Record<FounderStage, { fr: string; en: string }> = {
    first_time: { fr: "premier projet", en: "first-time founder" },
    second_time: { fr: "deuxième projet", en: "second-time founder" },
    experienced: { fr: "fondateur expérimenté", en: "experienced founder" },
  };

  const timeMap: Record<FounderTime, { fr: string; en: string }> = {
    weekend: { fr: "week-end", en: "weekends only" },
    parttime: { fr: "mi-temps", en: "part-time" },
    fulltime: { fr: "plein temps", en: "full-time" },
  };

  if (locale === "en") {
    const lines: string[] = [];
    if (profile.stage) lines.push(`- Profile: ${stageMap[profile.stage].en}`);
    if (profile.expertise) lines.push(`- Expertise: ${expertiseMap[profile.expertise].en}`);
    if (profile.time_commitment) lines.push(`- Available: ${timeMap[profile.time_commitment].en}`);
    if (profile.goals) lines.push(`- Goals: ${profile.goals}`);
    if (profile.founder_context) lines.push(`- About them: ${profile.founder_context}`);
    return `# About the founder you're working with\n${lines.join("\n")}\n\nAdapt your tone, depth, and examples accordingly. Don't quote this back — internalize it.`;
  }

  const lines: string[] = [];
  if (profile.stage) lines.push(`- Profil : ${stageMap[profile.stage].fr}`);
  if (profile.expertise) lines.push(`- Expertise : ${expertiseMap[profile.expertise].fr}`);
  if (profile.time_commitment) lines.push(`- Disponibilité : ${timeMap[profile.time_commitment].fr}`);
  if (profile.goals) lines.push(`- Objectifs : ${profile.goals}`);
  if (profile.founder_context) lines.push(`- À propos : ${profile.founder_context}`);
  return `# À propos du fondateur avec qui tu travailles\n${lines.join("\n")}\n\nAdapte ton ton, ta profondeur et tes exemples. Ne le cite pas — intègre-le.`;
}
