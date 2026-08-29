"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

export default function LoginPage() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Email not confirmed"
          ? t("errorEmailNotConfirmed")
          : t("errorInvalidCredentials")
      );
      return;
    }

    // Rechargement complet : le serveur doit récupérer les nouveaux cookies de session.
    window.location.href = "/dashboard";
  };

  return (
    <AuthShell
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      backLabel={t("backHome")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-white underline decoration-(--glass-hi) underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {t("signupLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-label={t("loginTitle")}>
        {status === "error" && errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {errorMsg}
          </div>
        )}

        <AuthField
          id="email"
          label={t("emailLabel")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={t("emailPlaceholder")}
          required
          disabled={status === "loading"}
          autoComplete="email"
        />

        <AuthField
          id="password"
          label={t("passwordLabel")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          minLength={6}
          disabled={status === "loading"}
          autoComplete="current-password"
        />

        <AuthSubmit loading={status === "loading"}>
          {status === "loading" ? t("loginLoading") : t("loginCta")}
        </AuthSubmit>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--text-muted) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
