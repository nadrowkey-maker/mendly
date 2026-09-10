"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { AuthField } from "@/components/auth/AuthField";

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
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
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
        title={t("forgotPasswordSuccessTitle")}
        subtitle={t("forgotPasswordSuccessBody")}
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
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      backLabel={t("backHome")}
      onSubmit={handleSubmit}
      loading={status === "loading"}
      error={status === "error" ? errorMsg : null}
      submitLabel={status === "loading" ? t("forgotPasswordLoading") : t("forgotPasswordCta")}
      colorway="ash"
      seed={33}
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
    </AuthShell>
  );
}
