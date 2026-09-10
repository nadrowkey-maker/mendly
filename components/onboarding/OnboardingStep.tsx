"use client";

import { useTranslations } from "next-intl";
import type {
  FounderExpertise,
  FounderStage,
  FounderTime,
} from "@/lib/types/profile";

/**
 * Le contenu d'une étape d'accueil, posé sur le dégradé.
 *
 * Tout est en blanc opaque sur fond coloré, jamais en translucide : une carte
 * de choix en verre change de contraste selon la tache qui passe derrière, et
 * on perd de vue laquelle est sélectionnée. Sur un formulaire qu'on ne remplit
 * qu'une fois, c'est le genre de flottement qui fait cliquer au hasard.
 *
 * La sélection renverse la carte en encre pleine. Pas une bordure d'accent :
 * une bordure se compare mal quand cinq cartes se suivent.
 */

export type Step = "stage" | "expertise" | "time" | "context" | "goals";

const STAGES = ["first_time", "second_time", "experienced"] as const;
const EXPERTISE = ["tech", "business", "design", "marketing", "mixed", "none"] as const;
const TIMES = ["weekend", "parttime", "fulltime"] as const;

interface OnboardingStepProps {
  step: Step;
  stage: FounderStage | null;
  expertise: FounderExpertise | null;
  time: FounderTime | null;
  context: string;
  goals: string;
  onStage: (v: FounderStage) => void;
  onExpertise: (v: FounderExpertise) => void;
  onTime: (v: FounderTime) => void;
  onContext: (v: string) => void;
  onGoals: (v: string) => void;
}

export function OnboardingStep(props: OnboardingStepProps) {
  const t = useTranslations("onboarding");
  const { step } = props;

  if (step === "stage") {
    return (
      <Frame question={t("stageQuestion")} help={t("stageHelp")}>
        <div className="space-y-2">
          {STAGES.map((s) => (
            <Card
              key={s}
              selected={props.stage === s}
              onClick={() => props.onStage(s)}
              title={t(`stage_${s}_label` as "stage_first_time_label")}
              description={t(`stage_${s}_desc` as "stage_first_time_desc")}
            />
          ))}
        </div>
      </Frame>
    );
  }

  if (step === "expertise") {
    return (
      <Frame question={t("expertiseQuestion")} help={t("expertiseHelp")}>
        <div className="grid grid-cols-2 gap-2">
          {EXPERTISE.map((e) => (
            <Chip
              key={e}
              selected={props.expertise === e}
              onClick={() => props.onExpertise(e)}
              label={t(`expertise_${e}` as "expertise_tech")}
            />
          ))}
        </div>
      </Frame>
    );
  }

  if (step === "time") {
    return (
      <Frame question={t("timeQuestion")} help={t("timeHelp")}>
        <div className="space-y-2">
          {TIMES.map((tc) => (
            <Card
              key={tc}
              selected={props.time === tc}
              onClick={() => props.onTime(tc)}
              title={t(`time_${tc}_label` as "time_weekend_label")}
              description={t(`time_${tc}_desc` as "time_weekend_desc")}
            />
          ))}
        </div>
      </Frame>
    );
  }

  const isContext = step === "context";
  const value = isContext ? props.context : props.goals;
  const onChange = isContext ? props.onContext : props.onGoals;

  return (
    <Frame
      question={isContext ? t("contextQuestion") : t("goalsQuestion")}
      help={isContext ? t("contextHelp") : t("goalsHelp")}
    >
      <textarea
        id={isContext ? "founder-context" : "founder-goals"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        maxLength={2000}
        aria-label={isContext ? t("contextQuestion") : t("goalsQuestion")}
        placeholder={isContext ? t("contextPlaceholder") : t("goalsPlaceholder")}
        className="w-full resize-none rounded-xl border border-black/8 bg-white px-4 py-3 text-[14px] text-(--ink) shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-(--ink-muted) focus:outline-2 focus:outline-offset-1 focus:outline-(--accent-primary)"
      />
      <p className="mt-2 text-right font-mono text-[11px] text-(--ink)/45">{value.length}/2000</p>
    </Frame>
  );
}

function Frame({
  question,
  help,
  children,
}: {
  question: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[19px] leading-snug font-bold tracking-tight text-(--ink)">{question}</h2>
      <p className="mt-1.5 mb-5 text-[13px] text-(--ink)/60">{help}</p>
      {children}
    </div>
  );
}

function Card({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-full cursor-pointer rounded-xl px-4 py-3.5 text-left transition-colors",
        selected
          ? "bg-(--ink) text-white"
          : "bg-white/92 text-(--ink) hover:bg-white",
      ].join(" ")}
    >
      <p className="text-[13.5px] font-semibold">{title}</p>
      <p className={["mt-0.5 text-[12px]", selected ? "text-white/60" : "text-(--ink)/55"].join(" ")}>
        {description}
      </p>
    </button>
  );
}

function Chip({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "cursor-pointer rounded-full px-4 py-3 text-[13px] font-medium transition-colors",
        selected ? "bg-(--ink) text-white" : "bg-white/92 text-(--ink) hover:bg-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
