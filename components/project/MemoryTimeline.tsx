"use client";

import { useTranslations } from "next-intl";
import { Gavel, FlaskConical, AlertTriangle, Trophy } from "lucide-react";
import type { MemoryEvent, MemoryKind } from "@/lib/types/tracking";

const KIND: Record<
  MemoryKind,
  { icon: typeof Gavel; color: string; labelKey: string }
> = {
  decision: { icon: Gavel, color: "#0071e3", labelKey: "kindDecision" },
  assumption: { icon: FlaskConical, color: "#5b9dff", labelKey: "kindAssumption" },
  risk: { icon: AlertTriangle, color: "#fbbf24", labelKey: "kindRisk" },
  milestone: { icon: Trophy, color: "#34d8b4", labelKey: "kindMilestone" },
};

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function MemoryTimeline({ events, locale }: { events: MemoryEvent[]; locale: string }) {
  const t = useTranslations("memory");

  if (events.length === 0) {
    return <p className="text-[15px] text-(--text-muted) leading-relaxed py-2">{t("timelineEmpty")}</p>;
  }

  return (
    <ol className="relative space-y-3">
      {events.map((e) => {
        const k = KIND[e.kind];
        const Icon = k.icon;
        return (
          <li
            key={e.id}
            className="flex items-start gap-3.5 rounded-2xl px-4 py-3.5 border border-(--border) bg-(--surface-1)"
          >
            <span
              className="shrink-0 grid place-items-center h-9 w-9 rounded-xl mt-0.5"
              style={{ background: `${k.color}1a`, border: `1px solid ${k.color}33` }}
            >
              <Icon className="w-4 h-4" style={{ color: k.color }} strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                  style={{ color: k.color }}
                >
                  {t(k.labelKey)}
                </span>
                <span className="text-[11px] text-(--text-dim)">{formatDate(e.created_at, locale)}</span>
              </div>
              <p className="text-[15px] text-(--text-primary) leading-snug mt-1">{e.title}</p>
              {e.detail && (
                <p className="text-[14px] text-(--text-muted) leading-relaxed mt-1">{e.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
