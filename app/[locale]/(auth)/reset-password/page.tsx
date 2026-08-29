"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

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
      <AuthShell
        title={t("resetPasswordSuccessTitle")}
        subtitle={t("resetPasswordSuccessBody")}
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
        <p className="text-center text-sm text-(--text-secondary)">
          {t("resetPasswordSuccessBody")}
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle")}
      backLabel={t("backHome")}
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-label={t("resetPasswordTitle")}>
        {!ready && (
          <p className="rounded-xl border border-(--glass-line) bg-white/3 px-4 py-3 text-sm text-(--text-secondary)">
            {t("resetPasswordWaiting")}
          </p>
        )}

        {status === "error" && errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {errorMsg}
          </div>
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

        <AuthSubmit loading={status === "loading"}>
          {status === "loading" ? t("resetPasswordLoading") : t("resetPasswordCta")}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
