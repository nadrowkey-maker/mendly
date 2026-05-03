"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-24 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {status === "success" ? (
          <div className="rounded-3xl border border-(--border-strong) bg-(--surface)/60 backdrop-blur-xl p-8 text-center space-y-4">
            <div className="text-5xl mb-2" role="img" aria-label="Email sent">✉️</div>
            <h2 className="text-2xl font-bold text-white">{t("forgotPasswordSuccessTitle")}</h2>
            <p className="text-(--text-muted) text-sm">{t("forgotPasswordSuccessBody")}</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-(--accent-glow) hover:text-(--accent-warm) transition-colors text-sm font-semibold"
            >
              {t("loginLink")} →
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {t("forgotPasswordTitle")}
              </h1>
              <p className="text-(--text-muted) text-sm">{t("forgotPasswordSubtitle")}</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-(--border-strong) bg-(--surface)/60 backdrop-blur-xl p-6 md:p-8 space-y-5"
            >
              {status === "error" && errorMsg && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
                >
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  placeholder={t("emailPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50"
                />
              </div>

              <PremiumButton
                variant="primary"
                size="lg"
                type="submit"
                disabled={status === "loading"}
                className="w-full"
              >
                {status === "loading" ? t("forgotPasswordLoading") : t("forgotPasswordCta")}
              </PremiumButton>
            </form>

            <p className="mt-6 text-center text-sm text-(--text-muted)">
              <Link
                href="/login"
                className="text-(--accent-glow) hover:text-(--accent-warm) transition-colors font-semibold"
              >
                ← {t("loginLink")}
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </main>
  );
}
