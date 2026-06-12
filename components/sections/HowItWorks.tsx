"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Users, Gavel, Brain } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  const steps = [
    { icon: MessageSquare, n: t("step1Number"), title: t("step1Title"), desc: t("step1Desc") },
    { icon: Users, n: t("step2Number"), title: t("step2Title"), desc: t("step2Desc") },
    { icon: Gavel, n: t("step3Number"), title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <AppleSection id="how-it-works" dark>
      <Reveal>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("titleLine1")}
          accent={t("titleAccent")}
          sub={t("sub")}
        />
      </Reveal>

      <div className="mt-16 space-y-4">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="group card-apple p-7 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-5 md:w-2/5 shrink-0">
                <span
                  className="font-semibold tracking-[-0.04em] leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(56px, 8vw, 96px)",
                    background: "linear-gradient(180deg, #f5f5f7 0%, #0071e3 150%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.n}
                </span>
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-(--apple-accent)/12 border border-(--apple-accent)/25 transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="w-6 h-6 text-(--apple-accent)" strokeWidth={1.6} />
                </span>
              </div>
              <div className="md:flex-1">
                <h3 className="text-[24px] md:text-[26px] font-semibold mb-2 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[17px] text-(--apple-text-2) leading-relaxed max-w-xl">{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-4">
        <div className="card-apple p-8 md:p-10 flex flex-col sm:flex-row items-start gap-5">
          <span className="grid place-items-center h-14 w-14 shrink-0 rounded-2xl bg-(--apple-accent)/12 border border-(--apple-accent)/25">
            <Brain className="w-7 h-7 text-(--apple-accent)" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-[22px] font-semibold mb-2">{t("memoryTitle")}</h3>
            <p className="text-[17px] text-(--apple-text-2) leading-relaxed max-w-2xl">{t("memoryDesc")}</p>
          </div>
        </div>
      </Reveal>
    </AppleSection>
  );
}
