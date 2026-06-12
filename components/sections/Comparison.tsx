"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Comparison() {
  const t = useTranslations("comparison");
  const diffs = [t("diff1"), t("diff2"), t("diff3"), t("diff4")];

  return (
    <AppleSection contentClassName="max-w-5xl">
      <Reveal>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("titleLine1")}
          accent={t("titleAccent")}
          sub={t("sub")}
        />
      </Reveal>

      <div className="mt-16 grid md:grid-cols-2 gap-5 items-stretch">
        {/* ChatGPT — one smooth voice */}
        <div className="card-apple flex flex-col p-7">
          <p className="pb-4 mb-6 border-b border-(--apple-border) text-[13px] font-semibold text-(--apple-text-2)">
            {t("chatgptLabel")}
          </p>
          <div className="flex flex-col gap-3 flex-1">
            <div className="self-end max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 bg-(--apple-text) text-(--apple-bg) text-[14px]">
              {t("chatgptQuestion")}
            </div>
            <div className="self-start max-w-[92%] rounded-2xl rounded-tl-md px-4 py-3 bg-(--apple-elev) border border-(--apple-border) text-[14px] text-(--apple-text-2) leading-relaxed">
              {t("chatgptAnswer")}
            </div>
          </div>
          <p className="mt-6 text-[13px] text-(--apple-text-2) leading-relaxed">{t("chatgptCaption")}</p>
        </div>

        {/* Mendly — a team that decides */}
        <div
          className="flex flex-col card-apple p-7"
          style={{ border: "1px solid rgba(0,113,227,0.45)" }}
        >
          <p className="pb-4 mb-6 border-b border-(--apple-border) text-[13px] font-semibold text-(--apple-accent)">
            {t("mendlyLabel")}
          </p>
          <div className="flex flex-col gap-2.5 flex-1">
            <Bubble role="CMO" text={t("mendlyCmo")} />
            <Bubble role="CFO" text={t("mendlyCfo")} />
            <div
              className="rounded-2xl p-4 mt-1"
              style={{ background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.3)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-6 w-6 rounded-lg text-[10px] font-semibold text-white bg-(--apple-accent)">
                  CEO
                </span>
                <span className="text-[14px] font-medium text-(--apple-text)">{t("mendlyVerdict")}</span>
                <Check className="w-4 h-4 ml-auto text-(--apple-accent)" strokeWidth={3} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-[13px] text-(--apple-text-2) leading-relaxed">{t("mendlyCaption")}</p>
        </div>
      </div>

      {/* Differentiators */}
      <div className="mt-5 card-apple overflow-hidden">
        <div className="flex items-center gap-3 px-5 sm:px-7 py-4 bg-(--apple-bg-soft)">
          <span className="flex-1 text-[13px] font-semibold text-(--apple-text-2)">{t("diffTitle")}</span>
          <span className="w-16 sm:w-24 text-center text-[13px] font-semibold text-(--apple-accent)">
            {t("diffMendly")}
          </span>
          <span className="w-16 sm:w-24 text-center text-[13px] font-medium text-(--apple-text-2)">
            {t("diffOthers")}
          </span>
        </div>
        {diffs.map((d, i) => (
          <div key={i} className="flex items-center gap-3 px-5 sm:px-7 py-4 border-t border-(--apple-border)">
            <span className="flex-1 text-[15px] text-(--apple-text)">{d}</span>
            <span className="w-16 sm:w-24 flex justify-center">
              <Check className="w-4 h-4 text-(--apple-accent)" strokeWidth={3} />
            </span>
            <span className="w-16 sm:w-24 flex justify-center">
              <X className="w-4 h-4 text-(--apple-text-2)" strokeWidth={2.5} />
            </span>
          </div>
        ))}
      </div>
    </AppleSection>
  );
}

function Bubble({ role, text }: { role: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 grid place-items-center h-7 w-7 rounded-lg text-[9px] font-semibold bg-(--apple-text) text-(--apple-bg)">
        {role}
      </span>
      <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-(--apple-elev) border border-(--apple-border) text-[14px] text-(--apple-text-2)">
        {text}
      </div>
    </div>
  );
}
