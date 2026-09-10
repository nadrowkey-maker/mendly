"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";

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
      onSubmit={handleSubmit}
      loading={status === "loading"}
      error={status === "error" ? errorMsg : null}
      submitLabel={status === "loading" ? t("loginLoading") : t("loginCta")}
      colorway="azure"
      seed={19}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
          >
            {t("signupLink")}
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
        autoComplete="current-password"
      />

      <Link
        href="/forgot-password"
        className="inline-block text-[12.5px] font-medium text-(--ink)/60 underline decoration-(--ink)/20 underline-offset-4 transition-colors hover:text-(--ink) hover:decoration-(--ink)/50"
      >
        {t("forgotPassword")}
      </Link>
    </AuthShell>
  );
}
