"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  Sparkles,
  User,
  LogOut,
  CreditCard,
  FileStack,
  Brain,
  Settings,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";
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
  lastAgentActivity?: Record<string, string>;
}

function relTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return locale === "fr" ? "à l'instant" : "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return locale === "fr" ? "hier" : "1d";
  if (d < 7) return `${d}${locale === "fr" ? "j" : "d"}`;
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

const AGENTS: { role: AgentRole; label: string; description: string; color: string }[] = [
  { role: "CEO", label: "CEO", description: "strategy",  color: "#0071e3" },
  { role: "CTO", label: "CTO", description: "tech",      color: "#06B6D4" },
  { role: "CMO", label: "CMO", description: "growth",    color: "#F0ABFC" },
  { role: "CPO", label: "CPO", description: "product",   color: "#34D399" },
  { role: "CFO", label: "CFO", description: "finance",   color: "#FBBF24" },
  { role: "CDO", label: "CDO", description: "data",      color: "#60A5FA" },
  { role: "DEV", label: "DEV", description: "code",      color: "#94A3B8" },
  { role: "CCO", label: "CCO", description: "content",   color: "#FB923C" },
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
  lastAgentActivity,
}: Props) {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const ratio = usageLimit > 0 ? usageUsed / usageLimit : 0;
  const activeAgentData = AGENTS.find((a) => a.role === activeAgent);

  if (collapsed) {
    return (
      <aside
        className="flex flex-col items-center gap-3 py-4 px-2 border-r border-[rgba(255,255,255,0.06)] w-14 shrink-0"
        style={{ background: "var(--bg-raised)" }}
      >
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer"
          title={t("expand")}
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
        <div className="w-px h-4 bg-white/8 rounded-full" />
        {/* Active agent avatar */}
        {activeAgentData && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-mono font-bold"
            style={{
              background: `${activeAgentData.color}22`,
              border: `1px solid ${activeAgentData.color}45`,
              color: activeAgentData.color,
            }}
            title={activeAgentData.label}
          >
            {activeAgentData.label}
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col w-72 h-full shrink-0 border-r border-[rgba(255,255,255,0.06)]"
      style={{ background: "var(--bg-raised)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)]">
        <Link
          href="/"
          className="font-bold tracking-[0.12em] text-white/90 text-sm hover:text-white transition-colors"
        >
          MENDLY
        </Link>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/55 hover:bg-white/5 transition-all cursor-pointer"
          title={t("collapse")}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[9px] font-mono tracking-[0.22em] text-white/22 uppercase">
              {t("projectsTitle")}
            </p>
            <Link
              href="/dashboard/new"
              className="w-5 h-5 rounded-md flex items-center justify-center text-white/22 hover:text-white/55 hover:bg-white/5 transition-colors"
              title={t("newProject")}
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {projects.map((p) => {
              const isActive = p.id === activeProjectId;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className={[
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200",
                    isActive
                      ? "bg-white/6 text-white/90"
                      : "text-white/38 hover:bg-white/4 hover:text-white/65",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200",
                      isActive ? "bg-[#0071e3]" : "bg-white/15",
                    ].join(" ")}
                  />
                  <span className="truncate">{p.name}</span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <Link
                href="/dashboard/new"
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] text-white/22 hover:text-white/50 hover:bg-white/3 transition-colors"
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
            <p className="text-[9px] font-mono tracking-[0.22em] text-white/22 uppercase px-2 mb-2">
              {t("agentsTitle")}
            </p>
            <div className="space-y-0.5">
              {AGENTS.map((a) => {
                const safePlan = (userPlan in PLANS ? userPlan : "free") as PlanTier;
                const allowed = (PLANS[safePlan].agentsAvailable as readonly string[]).includes(a.role);
                const isActive = a.role === activeAgent;
                const ts = lastAgentActivity?.[a.role];
                const recent = ts ? Date.now() - new Date(ts).getTime() < 86_400_000 : false;
                return (
                  <button
                    key={a.role}
                    onClick={() => allowed && onAgentChange(a.role)}
                    disabled={agentBusy || !allowed}
                    title={!allowed ? t("agentLocked") : a.label}
                    className={[
                      "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] transition-all duration-200 cursor-pointer",
                      !allowed ? "opacity-30 cursor-not-allowed" : "",
                      agentBusy && !isActive ? "opacity-60" : "",
                    ].join(" ")}
                    style={isActive ? { background: `${a.color}12` } : {}}
                  >
                    {/* Colored avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold shrink-0 transition-all duration-200"
                      style={{
                        background: isActive ? `${a.color}28` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isActive ? a.color + "50" : "rgba(255,255,255,0.07)"}`,
                        color: isActive ? a.color : "rgba(255,255,255,0.30)",
                      }}
                    >
                      {a.label}
                    </div>

                    <span
                      className="flex-1 text-left font-mono text-[11px] font-semibold tracking-wider transition-colors duration-200"
                      style={{ color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.40)" }}
                    >
                      {a.label}
                    </span>

                    {!allowed ? (
                      <Lock className="w-3 h-3 shrink-0 text-white/18" />
                    ) : ts ? (
                      <span className="flex items-center gap-1.5 shrink-0">
                        {recent && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span
                              className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                              style={{ background: a.color }}
                            />
                            <span
                              className="relative inline-flex h-1.5 w-1.5 rounded-full"
                              style={{ background: a.color }}
                            />
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-white/25">{relTime(ts, locale)}</span>
                      </span>
                    ) : (
                      <span
                        className="text-[9px] font-mono uppercase tracking-widest shrink-0 transition-colors duration-200"
                        style={{ color: isActive ? `${a.color}90` : "rgba(255,255,255,0.16)" }}
                      >
                        {a.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tools */}
        {activeProjectId && (
          <div>
            <p className="text-[9px] font-mono tracking-[0.22em] text-white/22 uppercase px-2 mb-2">
              {t("toolsTitle")}
            </p>
            <div className="space-y-0.5">
              <Link
                href={`/dashboard/projects/${activeProjectId}/deliverables`}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-white/38 hover:bg-white/4 hover:text-white/65 transition-colors"
              >
                <FileStack className="w-3.5 h-3.5 shrink-0" />
                {t("deliverables")}
              </Link>
              <Link
                href={`/dashboard/projects/${activeProjectId}/memory`}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-white/38 hover:bg-white/4 hover:text-white/65 transition-colors"
              >
                <Brain className="w-3.5 h-3.5 shrink-0" />
                {t("memory")}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-3 space-y-1">
        {/* Usage */}
        <div
          className="px-3 py-2.5 rounded-xl mb-1"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/22">
              {t("usage")}
            </span>
            <span className="text-[10px] font-mono font-semibold text-white/38">
              {usageLimit === -1 ? "unlimited" : `${usageUsed} / ${usageLimit}`}
            </span>
          </div>
          {usageLimit !== -1 && (
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ratio * 100)}%`,
                  background:
                    ratio >= 1
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : ratio >= 0.7
                        ? "linear-gradient(90deg, #fb923c, #f97316)"
                        : "linear-gradient(90deg, #0071e3, #60a5fa)",
                }}
              />
            </div>
          )}
        </div>

        {/* Plan */}
        <Link
          href="/upgrade"
          className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[13px] text-white/38 hover:bg-white/4 hover:text-white/65 transition-all"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="capitalize">{userPlan}</span>
          </span>
          <span className="text-[9px] font-mono text-white/18 uppercase tracking-widest">
            {userPlan === "free" ? t("upgrade") : t("manage")}
          </span>
        </Link>

        {/* Account */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-white/38 hover:bg-white/4 hover:text-white/65 transition-all cursor-pointer"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{
                background: "rgba(0,113,227,0.18)",
                border: "1px solid rgba(0,113,227,0.35)",
                color: "#0071e3",
              }}
            >
              {userEmail?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="truncate flex-1 text-left">{userEmail ?? t("account")}</span>
          </button>

          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden p-1"
                style={{ background: "var(--bg-overlay)" }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-white/6 hover:text-white/80 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  {t("dashboard")}
                </Link>
                <Link
                  href="/upgrade"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-white/6 hover:text-white/80 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {t("billing")}
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-white/6 hover:text-white/80 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {t("settings")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-red-500/12 hover:text-red-400 transition-colors cursor-pointer"
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
