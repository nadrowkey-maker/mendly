"use client";

import { useTranslations } from "next-intl";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function SoloFounderProof() {
  const t = useTranslations("soloFounderProof");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];
  const testimonials = [
    { quote: t("t1Quote"), name: t("t1Name"), role: t("t1Role") },
    { quote: t("t2Quote"), name: t("t2Name"), role: t("t2Role") },
    { quote: t("t3Quote"), name: t("t3Name"), role: t("t3Role") },
  ];

  return (
    <AppleSection>
      <Reveal>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleEm")} />
      </Reveal>

      <Reveal delay={0.08} className="mt-16">
        <div className="card-apple p-10 md:p-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="font-semibold tracking-[-0.03em] leading-none"
                style={{
                  fontSize: "clamp(34px, 5vw, 58px)",
                  background: "linear-gradient(180deg, #1d1d1f 0%, #0071e3 150%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <p className="mt-3 text-[15px] text-(--apple-text-2) leading-relaxed max-w-[14rem]">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {testimonials.map((tm, i) => (
          <Reveal key={i} delay={i * 0.08} className="h-full">
            <figure className="h-full card-apple p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5">
              <blockquote className="text-[17px] text-(--apple-text) leading-relaxed flex-1">“{tm.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-full text-[14px] font-semibold bg-(--apple-accent)/12 text-(--apple-accent) border border-(--apple-accent)/25 shrink-0">
                  {tm.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-[14px] font-medium">{tm.name}</span>
                  <span className="block text-[12px] text-(--apple-text-2)">{tm.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </AppleSection>
  );
}
