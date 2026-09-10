"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { PillAction } from "@/components/ui/Pill";
import { ChoiceGroup } from "@/components/settings/ChoiceGroup";
import type {
  UserProfile,
  FounderExpertise,
  FounderStage,
  FounderTime,
} from "@/lib/types/profile";

/**
 * Le profil du fondateur.
 *
 * Ce que ce formulaire contient n'est pas un « profil utilisateur » décoratif :
 * il part dans le contexte envoyé au modèle à chaque conversation. Un fondateur
 * à temps partiel sur un second projet ne doit pas recevoir les mêmes conseils
 * qu'un premier lancement à plein temps, et c'est ici que la différence se joue.
 */

const STAGES = ["first_time", "second_time", "experienced"] as const;
const EXPERTISE = ["tech", "business", "design", "marketing", "mixed", "none"] as const;
const TIMES = ["weekend", "parttime", "fulltime"] as const;

interface ProfileFormProps {
  profile: UserProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations("settings");

  const [stage, setStage] = useState<FounderStage | null>(profile?.stage ?? null);
  const [expertise, setExpertise] = useState<FounderExpertise | null>(profile?.expertise ?? null);
  const [time, setTime] = useState<FounderTime | null>(profile?.time_commitment ?? null);
  const [context, setContext] = useState(profile?.founder_context ?? "");
  const [goals, setGoals] = useState(profile?.goals ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await updateProfile({
      stage: stage ?? undefined,
      expertise: expertise ?? undefined,
      time_commitment: time ?? undefined,
      founder_context: context,
      goals,
    });

    setSaving(false);
    if (!res.success) {
      setError(res.error ?? t("errorGeneric"));
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ChoiceGroup
        label={t("stageLabel")}
        options={STAGES}
        value={stage}
        onChange={setStage}
        render={(s) => t(`stage_${s}` as "stage_first_time")}
        disabled={saving}
      />
      <ChoiceGroup
        label={t("expertiseLabel")}
        options={EXPERTISE}
        value={expertise}
        onChange={setExpertise}
        render={(e) => t(`expertise_${e}` as "expertise_tech")}
        disabled={saving}
      />
      <ChoiceGroup
        label={t("timeLabel")}
        options={TIMES}
        value={time}
        onChange={setTime}
        render={(tc) => t(`time_${tc}` as "time_weekend")}
        disabled={saving}
      />

      <TextArea
        id="founder-context"
        label={t("contextLabel")}
        placeholder={t("contextPlaceholder")}
        value={context}
        onChange={setContext}
        disabled={saving}
      />
      <TextArea
        id="goals"
        label={t("goalsLabel")}
        placeholder={t("goalsPlaceholder")}
        value={goals}
        onChange={setGoals}
        disabled={saving}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <PillAction type="submit" tone="light" size="md" disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              {t("saving")}
            </span>
          ) : (
            t("saveProfile")
          )}
        </PillAction>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] font-medium text-emerald-400"
            >
              {t("saved")}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="block text-[12px] font-semibold text-white/45">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        maxLength={2000}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-(--panel-line) bg-black/25 px-4 py-3 text-[14px] text-white transition-colors placeholder:text-white/22 focus:border-(--accent-primary) focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
