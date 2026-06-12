"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      if (error.message === "Email not confirmed") {
        setErrorMsg(t("errorEmailNotConfirmed"));
      } else {
        setErrorMsg(t("errorInvalidCredentials"));
      }
      return;
    }

    // Hard reload to ensure server picks up the new session cookies
    window.location.href = "/dashboard";
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-24 bg-(--bg-primary)">
      {/* Subtle violet ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,113,227,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("loginTitle")}
          </h1>
          <p className="text-(--text-muted) text-sm">{t("loginSubtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-(--border-strong) bg-(--surface)/60 backdrop-blur-xl p-6 md:p-8 space-y-5"
          aria-label={t("loginTitle")}
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

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={status === "loading"}
              placeholder="••••••••"
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
            {status === "loading" ? t("loginLoading") : t("loginCta")}
          </PremiumButton>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-(--text-dim) hover:text-(--text-muted) transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-(--text-muted)">
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="text-(--accent-glow) hover:text-(--accent-warm) transition-colors font-semibold"
          >
            {t("signupLink")}
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-(--text-dim) hover:text-(--text-muted) transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}