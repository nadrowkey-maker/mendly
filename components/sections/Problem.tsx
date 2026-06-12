"use client";

import { useTranslations } from "next-intl";
import { Bot, HeartHandshake, Hourglass } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function ProblemSection() {
  const t = useTranslations("problem");

  const cards = [
    { icon: Bot, title: t("card1Title"), desc: t("card1Desc") },
    { icon: HeartHandshake, title: t("card2Title"), desc: t("card2Desc") },
    { icon: Hourglass, title: t("card3Title"), desc: t("card3Desc") },
  ];

  return (
    <AppleSection dark>
      <Reveal>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("titleLine1")}
          accent={t("titleAccent")}
          sub={t("sub")}
        />
      </Reveal>

      <div className="mt-16 grid md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Reveal key={i} delay={i * 0.08} className="h-full">
            <div className="group h-full card-apple p-8 transition-all duration-300 hover:-translate-y-1.5">
              <span className="grid place-items-center h-12 w-12 rounded-2xl mb-6 bg-(--apple-accent)/12 border border-(--apple-accent)/25 transition-transform duration-300 group-hover:scale-110">
                <c.icon className="w-6 h-6 text-(--apple-accent)" strokeWidth={1.6} />
              </span>
              <h3 className="text-[20px] font-semibold mb-2 tracking-[-0.01em]">{c.title}</h3>
              <p className="text-[16px] text-(--apple-text-2) leading-relaxed">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-4">
        <div className="card-apple p-9 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div
            className="font-semibold tracking-[-0.03em] leading-none shrink-0"
            style={{
              fontSize: "clamp(72px, 12vw, 150px)",
              background: "linear-gradient(180deg, #ffffff 0%, #0071e3 140%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("statNumber")}
          </div>
          <p className="text-[20px] md:text-[22px] text-(--apple-text-2) leading-relaxed max-w-md">
            {t("statLabel")}
          </p>
        </div>
      </Reveal>
    </AppleSection>
  );
}
