"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Presentation, Sheet, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

type ExportType = "pitch" | "financials" | "prd";

export function ExportButtons({ projectId }: { projectId: string }) {
  const t = useTranslations("memory");
  const locale = useLocale();
  const [busy, setBusy] = useState<ExportType | null>(null);

  const run = async (type: ExportType) => {
    if (busy) return;
    setBusy(type);
    try {
      const res = await fetch("/api/deliverables/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type, locale }),
      });
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "pitch" ? "pitch.pptx" : type === "prd" ? "prd.pptx" : "financials.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    } finally {
      setBusy(null);
    }
  };

  const items: { type: ExportType; icon: typeof Presentation; label: string }[] = [
    { type: "pitch", icon: Presentation, label: t("exportPitch") },
    { type: "financials", icon: Sheet, label: t("exportFinancials") },
    { type: "prd", icon: FileText, label: t("exportPrd") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => run(type)}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-(--border-strong) bg-(--surface-2) text-[14px] text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === type ? (
            <Spinner variant="ring" size={16} className="text-(--accent-primary)" />
          ) : (
            <Icon className="w-4 h-4 text-(--accent-primary)" />
          )}
          {label}
        </button>
      ))}
    </div>
  );
}
