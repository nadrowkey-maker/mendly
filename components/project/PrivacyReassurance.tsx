"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Lock, Trash2 } from "lucide-react";

/**
 * Visible privacy reassurance (Bloc 3.1). Only states what is technically
 * true today: projects are private (RLS), encrypted in transit/at rest, and
 * deletable. We intentionally do NOT claim "never used to train models" until
 * the Gemini API tier / data-retention terms are verified.
 */
export function PrivacyReassurance({ className = "" }: { className?: string }) {
  const t = useTranslations("dataPledge");

  const items = [
    { icon: ShieldCheck, text: t("private") },
    { icon: Lock, text: t("encrypted") },
    { icon: Trash2, text: t("deletable") },
  ];

  return (
    <div className={`rounded-2xl glass-dark p-4 ${className}`}>
      <p className="text-[12px] font-semibold text-(--text-secondary) mb-3">{t("title")}</p>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <li key={i} className="flex items-center gap-2.5 text-[13px] text-(--text-muted)">
              <Icon className="w-3.5 h-3.5 shrink-0 text-(--aurora-teal)" />
              {it.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
