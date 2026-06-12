"use client";

import { useTranslations } from "next-intl";
import { Target, ListChecks, FileText, Share2 } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function WhatYouGetSection() {
  const t = useTranslations("whatYouGet");

  const cards = [
    { icon: Target, title: t("card1Title"), desc: t("card1Desc"), span: "md:col-span-4" },
    { icon: ListChecks, title: t("card2Title"), desc: t("card2Desc"), span: "md:col-span-2" },
    { icon: FileText, title: t("card3Title"), desc: t("card3Desc"), span: "md:col-span-2" },
    { icon: Share2, title: t("card4Title"), desc: t("card4Desc"), span: "md:col-span-4" },
  ];

  return (
    <AppleSection dark>
      <Reveal>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleEm")} />
      </Reveal>

      <div className="mt-16 grid md:grid-cols-6 gap-4 auto-rows-fr">
        {cards.map((c, i) => (
          <Reveal key={i} delay={i * 0.07} className={c.span}>
            <div className="group h-full card-apple p-8 md:p-9 flex flex-col transition-all duration-300 hover:-translate-y-1.5">
              <span className="grid place-items-center h-12 w-12 rounded-2xl mb-6 bg-(--apple-accent)/12 border border-(--apple-accent)/25 transition-transform duration-300 group-hover:scale-110">
                <c.icon className="w-6 h-6 text-(--apple-accent)" strokeWidth={1.6} />
              </span>
              <h3 className="text-[24px] font-semibold mb-2.5 tracking-[-0.02em]">{c.title}</h3>
              <p className="text-[16px] text-(--apple-text-2) leading-relaxed max-w-md">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </AppleSection>
  );
}
