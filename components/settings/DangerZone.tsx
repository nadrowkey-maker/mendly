"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteAccount } from "@/lib/actions/account";
import { SettingsSection } from "@/components/settings/SettingsSection";

/**
 * La suppression du compte.
 *
 * La confirmation par mot recopié est volontairement pénible : c'est la seule
 * action de tout le produit qui détruit la mémoire des projets sans retour
 * possible. Un simple « êtes-vous sûr ? » se clique par réflexe.
 *
 * Un abonnement actif bloque la suppression, et le blocage est expliqué avant
 * le bouton et non après le clic — découvrir l'obstacle une fois décidé est ce
 * qui transforme une résiliation en réclamation.
 */
interface DangerZoneProps {
  hasActiveSubscription: boolean;
}

export function DangerZone({ hasActiveSubscription }: DangerZoneProps) {
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim().toUpperCase() === t("deleteConfirmWord");

  const handleDelete = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    setError(null);

    const res = await deleteAccount();
    if (!res.success) {
      setDeleting(false);
      setError(res.error ?? t("errorGeneric"));
      return;
    }
    window.location.href = "/";
  };

  return (
    <SettingsSection
      title={t("dangerTitle")}
      subtitle={t("dangerSubtitle")}
      danger
      icon={<AlertTriangle className="size-4 text-red-400" />}
    >
      {hasActiveSubscription && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-200">
          {t("blockedByActiveSub")}
        </div>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={hasActiveSubscription}
          className="cursor-pointer rounded-full border border-red-500/40 px-5 py-2.5 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-[13.5px] text-white">
            {t("deleteConfirmInstruction", { word: t("deleteConfirmWord") })}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            placeholder={t("deleteConfirmWord")}
            aria-label={t("deleteAccount")}
            className="w-full rounded-xl border border-red-500/40 bg-black/30 px-4 py-3 text-[14px] text-white transition-colors placeholder:text-white/22 focus:border-red-400 focus:outline-none disabled:opacity-50"
          />
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
            >
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={deleting}
              className="cursor-pointer rounded-full border border-(--panel-line) px-5 py-2.5 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canConfirm || deleting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/50 bg-red-500/20 px-5 py-2.5 text-[13px] font-medium text-red-200 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {deleting && <Loader2 className="size-3.5 animate-spin" />}
              {deleting ? t("deleting") : t("confirmDelete")}
            </button>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
