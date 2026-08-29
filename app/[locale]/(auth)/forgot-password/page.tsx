"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

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
      <AuthShell
        title={t("forgotPasswordSuccessTitle")}
        subtitle={t("forgotPasswordSuccessBody")}
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
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      backLabel={t("backHome")}
      footer={
        <Link
          href="/login"
          className="font-semibold text-white underline decoration-(--glass-hi) underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
        >
          {t("loginLink")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-label={t("forgotPasswordTitle")}>
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

        <AuthSubmit loading={status === "loading"}>
          {status === "loading" ? t("forgotPasswordLoading") : t("forgotPasswordCta")}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
