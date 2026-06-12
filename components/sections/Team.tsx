"use client";

import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const AGENT_IDS = ["ceo", "cto", "cmo", "cpo", "cfo", "cdo", "dev", "cco"] as const;

export function TeamSection() {
  const t = useTranslations("team");

  return (
    <AppleSection id="team">
      <Reveal>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleEm")} sub={t("sub")} />
      </Reveal>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENT_IDS.map((id, i) => (
          <Reveal key={id} delay={(i % 4) * 0.06} className="h-full">
            <div className="group h-full card-apple p-5 transition-all duration-300 hover:-translate-y-1.5">
              <div className="flex items-center gap-3 mb-4">
                <span className="grid place-items-center h-11 w-11 rounded-2xl text-[11px] font-semibold shrink-0 bg-(--apple-accent)/12 text-(--apple-accent) border border-(--apple-accent)/25">
                  {t(`${id}Role`)}
                </span>
                <h3 className="text-[15px] font-semibold leading-tight">{t(`${id}Title`)}</h3>
              </div>
              <p className="text-[14px] text-(--apple-text-2) leading-snug mb-3">{t(`${id}Tagline`)}</p>
              <p className="text-[11px] text-(--apple-text-2) font-medium leading-relaxed">{t(`${id}Tags`)}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-5">
        <div className="card-apple p-8 md:p-10 flex flex-col sm:flex-row items-start gap-5">
          <span className="grid place-items-center h-14 w-14 shrink-0 rounded-2xl bg-(--apple-accent)/12 border border-(--apple-accent)/25">
            <Flame className="w-7 h-7 text-(--apple-accent)" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-[22px] font-semibold mb-2">{t("tensionTitle")}</h3>
            <p className="text-[17px] text-(--apple-text-2) leading-relaxed max-w-2xl">{t("tensionDesc")}</p>
          </div>
        </div>
      </Reveal>
    </AppleSection>
  );
}
