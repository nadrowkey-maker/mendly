"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { AuthField } from "@/components/auth/AuthField";

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
      <AuthNotice
        title={t("signupSuccessTitle")}
        subtitle={t("signupSuccessBody")}
        highlightLabel={t("emailLabel")}
        highlight={email}
        ctaLabel={t("loginLink")}
        ctaHref="/login"
        backLabel={t("backHome")}
      />
    );
  }

  return (
    <AuthShell
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      backLabel={t("backHome")}
      onSubmit={handleSubmit}
      loading={status === "loading"}
      error={status === "error" ? errorMsg : null}
      submitLabel={status === "loading" ? t("signupLoading") : t("signupCta")}
      colorway="signal"
      seed={26}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
          >
            {t("loginLink")}
          </Link>
        </>
      }
    >
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
    </AuthShell>
  );
}
