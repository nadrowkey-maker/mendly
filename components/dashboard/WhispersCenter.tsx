"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, MessageSquareDashed } from "lucide-react";
import { markAllWhispersRead, type WhisperWithProject } from "@/lib/actions/whispers";

function rel(iso: string, locale: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return locale === "fr" ? "à l'instant" : "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return locale === "fr" ? "hier" : "1d";
  if (d < 7) return `${d}${locale === "fr" ? "j" : "d"}`;
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
}

export function WhispersCenter({ initial }: { initial: WhisperWithProject[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [items, setItems] = useState(initial);
  const [, start] = useTransition();
  const unread = items.filter((w) => !w.read).length;

  const markAll = () =>
    start(async () => {
      await markAllWhispersRead();
      setItems((prev) => prev.map((w) => ({ ...w, read: true })));
    });

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,113,227,0.07) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[13px] text-(--text-dim) hover:text-(--text-secondary) transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("whispersBack")}
        </Link>

        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-[40px] font-semibold tracking-[-0.03em] text-(--text-primary)">
              {t("whispersCenterTitle")}
            </h1>
            <p className="text-(--text-muted) mt-2 max-w-md">{t("whispersCenterSub")}</p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium glass-dark text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
            >
              {t("whispersMarkAll")}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass-dark rounded-3xl p-12 md:p-16 text-center">
            <span className="mx-auto mb-5 grid place-items-center h-14 w-14 rounded-2xl bg-(--accent-primary)/12 border border-(--accent-primary)/25">
              <MessageSquareDashed className="w-7 h-7 text-(--accent-primary)" />
            </span>
            <h2 className="text-xl font-semibold text-(--text-primary) mb-2">{t("whispersEmpty")}</h2>
            <p className="text-(--text-muted) max-w-sm mx-auto">{t("whispersEmptyBody")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((w) => {
              const accent = w.projects?.accent_color || "#0071e3";
              return (
                <Link
                  key={w.id}
                  href={`/dashboard/projects/${w.project_id}`}
                  className="block glass-dark rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="grid place-items-center h-6 w-6 rounded-lg text-[8px] font-semibold shrink-0"
                      style={{ background: `${accent}1f`, color: accent, border: `1px solid ${accent}38` }}
                    >
                      {w.agent_role}
                    </span>
                    <span className="text-[13px] font-semibold text-(--text-secondary)">{w.agent_role}</span>
                    {w.projects?.name && (
                      <span className="text-[12px] text-(--text-dim) truncate">
                        · {w.projects.emoji ? `${w.projects.emoji} ` : ""}
                        {w.projects.name}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-2 shrink-0">
                      {!w.read && <span className="h-2 w-2 rounded-full bg-(--accent-primary)" />}
                      <span className="text-[11px] text-(--text-dim)">{rel(w.created_at, locale)}</span>
                    </span>
                  </div>
                  <p className="text-[14px] text-(--text-secondary) italic leading-snug">{w.content}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
