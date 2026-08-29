"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

/**
 * Inscription.
 *
 * Le flux "question en attente" a été retiré : il stockait dans localStorage la
 * question saisie dans l'ancien hero, pour la rejouer après inscription. Ce
 * hero n'existe plus, donc plus personne n'écrivait cette valeur — et
 * localStorage est interdit par la charte du projet.
 */
export default function SignupPage() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (password.length < 6) {
      setStatus("error");
      setErrorMsg(t("errorPasswordTooShort"));
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <AuthShell
        title={t("signupSuccessTitle")}
        subtitle={t("signupSuccessBody")}
        backLabel={t("backHome")}
      >
        <div className="space-y-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--accent-glow)">
            {t("emailLabel")}
          </p>
          <p className="text-sm text-white">{email}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      backLabel={t("backHome")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-white underline decoration-(--glass-hi) underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {t("loginLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-label={t("signupTitle")}>
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
          autoComplete="new-password"
        />

        <AuthSubmit loading={status === "loading"}>
          {status === "loading" ? t("signupLoading") : t("signupCta")}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
