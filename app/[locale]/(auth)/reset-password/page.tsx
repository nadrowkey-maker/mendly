"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY once the URL token is consumed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setStatus("error");
      setErrorMsg(t("errorPasswordTooShort"));
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMsg(t("errorPasswordMismatch"));
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/dashboard"), 2000);
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
            <div className="text-5xl mb-2" role="img" aria-label="Success">✅</div>
            <h2 className="text-2xl font-bold text-white">{t("resetPasswordSuccessTitle")}</h2>
            <p className="text-(--text-muted) text-sm">{t("resetPasswordSuccessBody")}</p>
          </div>
        ) : !ready ? (
          <div className="text-center text-(--text-muted) text-sm">{t("resetPasswordWaiting")}</div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {t("resetPasswordTitle")}
              </h1>
              <p className="text-(--text-muted) text-sm">{t("resetPasswordSubtitle")}</p>
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
                  htmlFor="password"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("resetPasswordNewLabel")}
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

              <div className="space-y-2">
                <label
                  htmlFor="confirm"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("resetPasswordConfirmLabel")}
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {status === "loading" ? t("resetPasswordLoading") : t("resetPasswordCta")}
              </PremiumButton>
            </form>

            <p className="mt-6 text-center">
              <Link
                href="/login"
                className="text-xs text-(--text-dim) hover:text-(--text-muted) transition-colors"
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
