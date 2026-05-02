"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";
import type { DebateAgentRole } from "@/lib/types/debate";

interface Props {
  agent: DebateAgentRole;
  reason: string;
  onAccept: (agent: DebateAgentRole, reason: string) => Promise<void>;
  busy: boolean;
}

export function AgentInvite({ agent, reason, onAccept, busy }: Props) {
  const t = useTranslations("chat");
  const [dismissed, setDismissed] = useState(false);
  const [accepting, setAccepting] = useState(false);

  if (dismissed) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(agent, reason);
    } finally {
      setAccepting(false);
      setDismissed(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="mt-3 p-4 rounded-2xl border border-(--accent-glow)/30 bg-(--accent-glow)/5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-(--accent-glow)/20 border border-(--accent-glow)/40 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4 text-(--accent-glow)" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold tracking-widest text-(--accent-glow) uppercase">
              {t("inviteSuggestion")}
            </p>
            <p className="text-sm font-bold text-(--text-primary)">
              {t("inviteAgentInto", { agent })}
            </p>
          </div>
        </div>
        <p className="text-sm text-(--text-secondary) mb-4 italic">"{reason}"</p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={busy || accepting}
            className="flex-1 h-9 rounded-full bg-(--accent-glow) text-(--bg-primary) text-sm font-bold hover:bg-(--accent-warm) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? t("loading") : t("inviteCta", { agent })}
          </button>
          <button
            onClick={() => setDismissed(true)}
            disabled={busy || accepting}
            className="h-9 px-4 rounded-full border border-(--border-strong) text-(--text-muted) text-sm hover:text-(--text-primary) hover:bg-(--surface) transition-colors cursor-pointer disabled:opacity-50"
          >
            {t("inviteDismiss")}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
