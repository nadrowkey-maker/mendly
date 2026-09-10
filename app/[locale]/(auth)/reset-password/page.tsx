"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { AuthField } from "@/components/auth/AuthField";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase émet PASSWORD_RECOVERY une fois le jeton de l'URL consommé.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
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
  };

  if (status === "success") {
    return (
      <AuthNotice
        title={t("resetPasswordSuccessTitle")}
        subtitle={t("resetPasswordSuccessBody")}
        ctaLabel={t("loginLink")}
        ctaHref="/login"
        backLabel={t("backHome")}
      />
    );
  }

  return (
    <AuthShell
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle")}
      backLabel={t("backHome")}
      onSubmit={handleSubmit}
      loading={status === "loading"}
      error={status === "error" ? errorMsg : null}
      submitLabel={status === "loading" ? t("resetPasswordLoading") : t("resetPasswordCta")}
      colorway="azure"
      seed={52}
    >
      {!ready && (
        <p className="rounded-xl bg-white/85 px-4 py-3 text-[13px] text-(--ink-soft) backdrop-blur-sm">
          {t("resetPasswordWaiting")}
        </p>
      )}

      <AuthField
        id="password"
        label={t("resetPasswordNewLabel")}
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        required
        minLength={6}
        disabled={status === "loading"}
        autoComplete="new-password"
      />

      <AuthField
        id="confirm"
        label={t("resetPasswordConfirmLabel")}
        type="password"
        value={confirm}
        onChange={setConfirm}
        placeholder="••••••••"
        required
        minLength={6}
        disabled={status === "loading"}
        autoComplete="new-password"
      />
    </AuthShell>
  );
}
