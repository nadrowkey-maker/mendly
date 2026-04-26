"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { GradientText } from "@/components/ui/gradient-text";
import { PremiumButton } from "@/components/ui/PremiumButton";

export function ComingSoon() {
  const t = useTranslations("comingSoon");
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-xl">
        <p className="text-[10px] tracking-[0.3em] text-(--accent-glow) uppercase mb-6 font-mono">
          {t("eyebrow")}
        </p>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t("title")}{" "}
          <GradientText as="span" className="bg-transparent dark:bg-transparent">
            <em className="font-fraunces">{t("titleEm")}</em>
          </GradientText>
        </h1>

        <p className="text-base md:text-lg text-(--text-muted) mb-10 leading-relaxed">
          {t("sub")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumButton variant="primary" size="lg" onClick={() => router.push("/waitlist")}>
            {t("cta")}
          </PremiumButton>
          <PremiumButton variant="secondary" size="lg" onClick={() => router.push("/")}>
            {t("back")}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
