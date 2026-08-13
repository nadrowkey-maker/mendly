"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { Project } from "@/lib/types/project";

// Same palette as DebateView.tsx — the header roster and the debate bubbles
// underneath it must read as the same room, not two different UIs.
const AGENT_COLORS: Record<string, string> = {
  CEO: "#0071e3",
  CTO: "#5b9dff",
  CMO: "#f472b6",
  CFO: "#fbbf24",
  CPO: "#34d8b4",
  CDO: "#38bdf8",
  DEV: "#94A3B8",
  CCO: "#fb7185",
};

interface TeamRoomHeaderProps {
  project: Project;
}

export function TeamRoomHeader({ project }: TeamRoomHeaderProps) {
  const t = useTranslations("teamRoom");
  const agents = project.assigned_agents ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[24px] border border-(--border-strong) bg-(--surface-1) p-5 md:p-6 mb-6"
    >
      <div className="aurora-bar absolute top-0 left-0 right-0" />

      <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-1">
        {t("eyebrow")}
      </p>
      <h2 className="text-lg md:text-xl font-bold text-(--text-primary) mb-4 tracking-tight">
        {t("title", { projectName: project.name })}
      </h2>

      {agents.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {agents.map((role, i) => {
            const color = AGENT_COLORS[role] ?? "#94A3B8";
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border"
                style={{ borderColor: `${color}40`, background: `${color}0d` }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0"
                  style={{ color, background: `${color}1a` }}
                >
                  {role}
                </span>
                <span className="text-[11px] font-mono font-semibold" style={{ color }}>
                  {role}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {project.team_rationale && (
        <p className="text-[13px] text-(--text-muted) italic leading-relaxed max-w-xl">
          {project.team_rationale}
        </p>
      )}
    </motion.div>
  );
}

export function TeamRoomEmptyState() {
  const t = useTranslations("teamRoom");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-col items-center justify-center text-center py-14 px-6"
    >
      <div className="w-11 h-11 rounded-2xl bg-(--surface-1) border border-(--border) flex items-center justify-center mb-4">
        <Users className="w-4.5 h-4.5 text-(--text-dim)" />
      </div>
      <p className="text-(--text-secondary) text-sm mb-1">{t("emptyTitle")}</p>
      <p className="text-(--text-dim) text-xs max-w-xs leading-relaxed">{t("emptyHint")}</p>
    </motion.div>
  );
}
