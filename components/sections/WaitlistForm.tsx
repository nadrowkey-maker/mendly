"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { PremiumButton } from "@/components/ui/PremiumButton";

type FormState = "idle" | "loading" | "success" | "error";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
});

export function WaitlistForm() {
  const t = useTranslations("waitlist");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading" || formState === "success") return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg(t("errorInvalid"));
      setFormState("error");
      inputRef.current?.focus();
      return;
    }

    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, locale }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(
          data.error === "invalid_email" ? t("errorInvalid") : t("errorGeneric")
        );
        setFormState("error");
        return;
      }

      setFormState("success");
    } catch {
      setErrorMsg(t("errorGeneric"));
      setFormState("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-20 md:py-28">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[rgba(139,92,246,0.10)] blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-[rgba(6,182,212,0.06)] blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Eyebrow */}
        <motion.p
          {...fadeUp()}
          className="text-[10px] tracking-[0.3em] text-(--accent-glow) uppercase mb-6 font-mono text-center"
        >
          MENDLY · EARLY ACCESS
        </motion.p>

        {/* Heading */}
        <motion.h1
          {...fadeUp(0.08)}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight text-center"
        >
          {t("title")}{" "}
          <GradientText as="span" className="bg-transparent dark:bg-transparent">
            <em className="font-fraunces">{t("titleEm")}</em>
          </GradientText>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.14)}
          className="text-lg md:text-xl text-(--text-muted) max-w-2xl mx-auto mb-14 text-center leading-relaxed"
        >
          {t("sub")}
        </motion.p>

        {/* Form / Success */}
        <motion.div {...fadeUp(0.2)} className="max-w-xl mx-auto">
          {formState === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="text-center"
            >
              <div
                className="w-16 h-16 rounded-full bg-(--accent-primary)/20 flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}
              >
                <span className="text-2xl text-(--accent-glow) font-bold">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t("successTitle")}</h2>
              <p className="text-(--text-muted) leading-relaxed max-w-sm mx-auto">
                {t("successBody")}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formState === "error") setFormState("idle");
                  }}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  aria-label={t("emailPlaceholder")}
                  className="flex-1 px-5 py-3.5 rounded-full bg-(--surface)/60 border border-(--border) text-(--text-primary) placeholder:text-(--text-dim) focus:outline-none focus:border-(--accent-primary) focus:ring-1 focus:ring-(--accent-primary) transition-colors duration-200 text-sm"
                />
                <PremiumButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={formState === "loading"}
                  className="shrink-0"
                >
                  {formState === "loading" ? t("sending") : t("cta")}
                </PremiumButton>
              </div>

              {formState === "error" && errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-red-400 text-center"
                  role="alert"
                >
                  {errorMsg}
                </motion.p>
              )}

              <p className="mt-4 text-xs text-(--text-dim) text-center">{t("disclaimer")}</p>
            </form>
          )}
        </motion.div>

        {/* Decorative counter strip */}
        <motion.div
          {...fadeUp(0.28)}
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16"
        >
          {[
            { value: "247", label: "founders waiting" },
            { value: "48h", label: "to launch" },
            { value: "8", label: "AI executives" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ textShadow: "0 0 24px rgba(139,92,246,0.4)" }}
              >
                {value}
              </p>
              <p className="text-xs text-(--text-dim) mt-1 tracking-wider uppercase font-mono">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
