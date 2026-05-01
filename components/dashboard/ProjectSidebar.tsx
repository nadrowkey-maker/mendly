"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  Sparkles,
  User,
  LogOut,
  CreditCard,
  FileStack,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types/project";
import type { AgentRole } from "@/lib/types/conversation";

interface Props {
  projects: Project[];
  activeProjectId: string;
  activeAgent: AgentRole;
  onAgentChange: (agent: AgentRole) => void;
  agentBusy: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  usageUsed: number;
  usageLimit: number;
  userPlan: string;
  userEmail: string | null;
}

const AGENTS: { role: AgentRole; label: string; description: string }[] = [
  { role: "CEO", label: "CEO", description: "strategy" },
  { role: "CTO", label: "CTO", description: "tech" },
  { role: "CMO", label: "CMO", description: "growth" },
  { role: "CPO", label: "CPO", description: "product" },
  { role: "CFO", label: "CFO", description: "finance" },
  { role: "CDO", label: "CDO", description: "data" },
  { role: "DEV", label: "DEV", description: "code" },
  { role: "CCO", label: "CCO", description: "content" },
];

export function ProjectSidebar({
  projects,
  activeProjectId,
  activeAgent,
  onAgentChange,
  agentBusy,
  collapsed,
  onToggleCollapse,
  usageUsed,
  usageLimit,
  userPlan,
  userEmail,
}: Props) {
  const t = useTranslations("sidebar");
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const remaining = usageLimit === -1 ? -1 : Math.max(0, usageLimit - usageUsed);
  const ratio = usageLimit > 0 ? usageUsed / usageLimit : 0;

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center gap-2 py-4 px-2 border-r border-(--border) bg-(--bg-secondary) w-14 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface) transition-colors cursor-pointer"
          title={t("expand")}
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-72 shrink-0 border-r border-(--border) bg-(--bg-secondary)">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-(--border)">
        <Link
          href="/"
          className="font-bold tracking-tight text-(--text-primary) text-sm hover:opacity-70 transition-opacity"
        >
          MENDLY
        </Link>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface) transition-colors cursor-pointer"
          title={t("collapse")}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-mono tracking-widest text-(--text-dim) uppercase">
              {t("projectsTitle")}
            </p>
            <Link
              href="/dashboard/new"
              className="w-5 h-5 rounded-md flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface) transition-colors"
              title={t("newProject")}
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-0.5">
            {projects.map((p) => {
              const active = p.id === activeProjectId;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className={[
                    "group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-(--surface) text-(--text-primary)"
                      : "text-(--text-secondary) hover:bg-(--surface)/60 hover:text-(--text-primary)",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      active ? "bg-(--accent-glow)" : "bg-(--text-dim)",
                    ].join(" ")}
                  />
                  <span className="truncate">{p.name}</span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <Link
                href="/dashboard/new"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-(--text-dim) hover:text-(--text-primary) hover:bg-(--surface)/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("createFirst")}
              </Link>
            )}
          </div>
        </div>

        {/* Agents */}
        {activeProjectId && (
          <div>
            <p className="text-[10px] font-mono tracking-widest text-(--text-dim) uppercase px-2 mb-2">
              {t("agentsTitle")}
            </p>
            <div className="space-y-0.5">
              {AGENTS.map((a) => {
                const active = a.role === activeAgent;
                return (
                  <button
                    key={a.role}
                    onClick={() => onAgentChange(a.role)}
                    disabled={agentBusy}
                    className={[
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                      active
                        ? "bg-(--surface) text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--surface)/60 hover:text-(--text-primary)",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={[
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          active ? "bg-(--accent-glow)" : "bg-(--text-dim)",
                        ].join(" ")}
                      />
                      <span className="font-mono text-xs font-bold">
                        {a.label}
                      </span>
                    </span>
                    <span className="text-[10px] text-(--text-dim) font-mono uppercase tracking-wider">
                      {a.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick links */}
        {activeProjectId && (
          <div>
            <p className="text-[10px] font-mono tracking-widest text-(--text-dim) uppercase px-2 mb-2">
              {t("toolsTitle")}
            </p>
            <div className="space-y-0.5">
              <Link
                href={`/dashboard/projects/${activeProjectId}/deliverables`}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface)/60 hover:text-(--text-primary) transition-colors"
              >
                <FileStack className="w-3.5 h-3.5" />
                {t("deliverables")}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Account section */}
      <div className="border-t border-(--border) p-3 space-y-1">
        {/* Usage */}
        <div className="px-2 py-2 rounded-lg bg-(--surface)/40 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-(--text-dim)">
              {t("usage")}
            </span>
            <span className="text-[10px] font-mono font-bold text-(--text-secondary)">
              {usageLimit === -1
                ? "∞"
                : `${usageUsed}/${usageLimit}`}
            </span>
          </div>
          {usageLimit !== -1 && (
            <div className="h-1 bg-(--border) rounded-full overflow-hidden">
              <div
                className="h-full transition-all rounded-full"
                style={{
                  width: `${Math.min(100, ratio * 100)}%`,
                  background:
                    ratio >= 1
                      ? "var(--danger)"
                      : ratio >= 0.7
                        ? "var(--warning)"
                        : "var(--accent-glow)",
                }}
              />
            </div>
          )}
        </div>

        {/* Plan */}
        <Link
          href="/upgrade"
          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary) transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-(--accent-glow)" />
            <span className="capitalize">{userPlan}</span>
          </span>
          <span className="text-[10px] font-mono text-(--text-dim) uppercase">
            {userPlan === "free" ? t("upgrade") : t("manage")}
          </span>
        </Link>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-(--accent-glow)/20 border border-(--accent-glow)/40 flex items-center justify-center text-[10px] font-bold text-(--accent-glow) shrink-0">
              {userEmail?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="truncate flex-1 text-left">
              {userEmail ?? t("account")}
            </span>
          </button>

          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-(--border-strong) bg-(--surface-elevated) shadow-lg overflow-hidden p-1"
              >
                <Link
                  href="/dashboard"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary) transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  {t("dashboard")}
                </Link>
                <Link
                  href="/upgrade"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary) transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {t("billing")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--surface) hover:text-(--danger) transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("signOut")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}