"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";
import { Sparkles } from "@/components/ui/Sparkles";

export function FinalCtaSection() {
  const t = useTranslations("finalCta");
  const router = useRouter();

  return (
    <section className="on-dark relative overflow-hidden bg-(--apple-bg) text-(--apple-text) min-h-screen flex items-center px-6 py-28">
      <Sparkles
        className="absolute inset-0 pointer-events-none"
        density={200}
        size={1.1}
        speed={0.4}
        opacity={0.5}
        minOpacity={0.05}
        color="#ffffff"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="mb-4 text-[15px] font-semibold tracking-tight text-(--apple-accent)">{t("eyebrow")}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="font-semibold tracking-tight" style={{ fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 1.04 }}>
            {t("title")} <span className="text-(--apple-accent)">{t("titleAccent")}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-6 mx-auto max-w-xl text-[21px] text-(--apple-text-2) leading-relaxed">{t("sub")}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={() => router.push("/signup")}
              className="btn-apple transition-transform duration-200 hover:scale-[1.03]"
            >
              {t("cta")}
            </button>
            <p className="text-[13px] text-(--apple-text-2)">{t("subCta")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
