"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown, Sparkles } from "lucide-react";
import {
  listAutonomousSessions,
  markAutonomousSessionsSeen,
} from "@/lib/actions/debates";
import type { DebateRecord } from "@/lib/types/tracking";

interface AutonomousSessionsProps {
  projectId: string;
}

/**
 * Ce que l'équipe a produit pendant l'absence du fondateur.
 *
 * C'est le moment qui donne son sens au travail autonome : une équipe qui
 * bosse sans qu'on le sache ne vaut rien, ce qui compte est ce qu'on trouve en
 * revenant. D'où le compteur, et l'ouverture du premier élément par défaut.
 *
 * Marque les sessions comme lues à l'affichage — sans quoi le cron d'équipe
 * s'arrêterait après sa toute première session.
 */
export function AutonomousSessions({ projectId }: AutonomousSessionsProps) {
  const t = useTranslations("teamRoom");
  const [sessions, setSessions] = useState<DebateRecord[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const rows = await listAutonomousSessions(projectId);
      if (cancelled || rows.length === 0) return;

      const unseen = rows.filter((r) => !r.seen_at);
      setSessions(rows);
      setUnseenCount(unseen.length);
      setOpenId(rows[0].id);

      if (unseen.length > 0) await markAutonomousSessionsSeen(projectId);
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (sessions.length === 0) return null;

  return (
    <section
      aria-label={t("autonomousTitle")}
      className="rounded-[24px] border border-(--border-strong) bg-(--surface-1) p-5 md:p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-3.5 text-(--accent-glow)" aria-hidden="true" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase">
          {t("autonomousEyebrow")}
        </p>
      </div>

      <h3 className="text-base md:text-lg font-bold text-(--text-primary) mb-4 tracking-tight">
        {unseenCount > 0
          ? t("autonomousTitleNew", { count: unseenCount })
          : t("autonomousTitle")}
      </h3>

      <ul className="flex flex-col gap-2">
        {sessions.map((session) => {
          const isOpen = openId === session.id;
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : session.id)}
                aria-expanded={isOpen}
                className="w-full flex items-start gap-3 text-left rounded-2xl px-4 py-3 border border-(--border) hover:border-(--border-strong) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)"
              >
                <ChevronDown
                  className={`size-4 mt-0.5 shrink-0 text-(--text-dim) transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="flex-1">
                  <span className="block text-sm text-(--text-primary) font-medium">
                    {session.question}
                  </span>
                  <span className="block text-xs text-(--text-dim) mt-0.5">
                    {(session.agents ?? []).join(" · ")}
                  </span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && session.verdict && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pt-3 pb-1 text-sm leading-relaxed text-(--text-muted) whitespace-pre-wrap">
                      {session.verdict}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
