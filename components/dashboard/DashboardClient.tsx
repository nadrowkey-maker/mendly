"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Sparkles, Circle, ListChecks, MessageSquareDashed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ProjectCardMenu } from "@/components/dashboard/ProjectCardMenu";
import { EditProjectModal } from "@/components/dashboard/EditProjectModal";
import { PrivacyReassurance } from "@/components/project/PrivacyReassurance";
import type { Project } from "@/lib/types/project";
import type { ActionItem } from "@/lib/types/tracking";

interface ProjectBriefing {
  lastDecision?: string;
  nextAction?: string;
}

interface DashboardClientProps {
  projects: Project[];
  userEmail: string | null;
  openActions: ActionItem[];
  whisperCounts: Record<string, number>;
  briefings: Record<string, ProjectBriefing>;
}

export function DashboardClient({
  projects: initialProjects,
  userEmail,
  openActions,
  whisperCounts,
  briefings,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const pending = localStorage.getItem("mendly:pending_question");
    if (pending) {
      localStorage.removeItem("mendly:pending_question");
      router.push(`/dashboard/new?desc=${encodeURIComponent(pending)}`);
    }
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const totalWhispers = Object.values(whisperCounts).reduce((a, b) => a + b, 0);

  const stageLabel = (stage: string) => {
    const map: Record<string, string> = {
      idea: t("stage_idea"),
      mvp: t("stage_mvp"),
      launched: t("stage_launched"),
      scaling: t("stage_scaling"),
    };
    return map[stage] ?? stage;
  };

  const stageColor = (stage: string) => {
    const map: Record<string, string> = {
      idea: "text-(--accent-warm) border-(--accent-warm)/30 bg-(--accent-warm)/5",
      mvp: "text-(--accent-glow) border-(--accent-glow)/30 bg-(--accent-glow)/5",
      launched: "text-emerald-300 border-emerald-500/30 bg-emerald-500/5",
      scaling: "text-sky-300 border-sky-500/30 bg-sky-500/5",
    };
    return map[stage] ?? "text-(--text-muted) border-(--border)";
  };

  const handleProjectDeleted = (projectId: string) => {
    startTransition(() => setProjects((prev) => prev.filter((p) => p.id !== projectId)));
  };
  const handleProjectUpdated = (updated: Project) => {
    startTransition(() => setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p))));
  };

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,113,227,0.07) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-[40px] font-semibold tracking-[-0.03em] text-(--text-primary)">
              {t("welcome")}
            </h1>
            {/* Living briefing */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {openActions.length === 0 && totalWhispers === 0 ? (
                <span className="text-sm text-(--text-muted)">{t("allClear")}</span>
              ) : (
                <>
                  {openActions.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-(--border-strong) bg-(--surface-1) text-[12px] text-(--text-secondary)">
                      <ListChecks className="w-3.5 h-3.5 text-(--accent-primary)" />
                      <span className="font-semibold text-(--text-primary)">{openActions.length}</span>
                      {t("openActionsTitle")}
                    </span>
                  )}
                  {totalWhispers > 0 && (
                    <Link
                      href="/dashboard/whispers"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-(--border-strong) bg-(--surface-1) text-[12px] text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-primary) transition-colors"
                    >
                      <MessageSquareDashed className="w-3.5 h-3.5 text-(--aurora-teal)" />
                      <span className="font-semibold text-(--text-primary)">{totalWhispers}</span>
                      {t("whispersLabel")}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 pt-1">
            <Link
              href="/settings"
              className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-(--text-primary) uppercase transition-colors"
            >
              {t("settings")}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-(--text-primary) uppercase transition-colors cursor-pointer"
            >
              {t("signOut")}
            </button>
          </div>
        </div>

        {/* Open actions block */}
        {openActions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 rounded-[28px] glass-dark p-5 md:p-6"
          >
            <h2 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-(--accent-primary)" />
              {t("openActionsTitle")}
            </h2>
            <ul className="space-y-1">
              {openActions.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/projects/${a.project_id}/memory`}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-(--surface-2) transition-colors"
                  >
                    <Circle className="w-4 h-4 shrink-0 text-(--text-dim) group-hover:text-(--accent-primary) transition-colors" />
                    <span className="flex-1 text-[14px] text-(--text-secondary) group-hover:text-(--text-primary) transition-colors truncate">
                      {a.content}
                    </span>
                    <span className="shrink-0 text-[11px] font-mono text-(--text-dim) px-2 py-0.5 rounded-full bg-(--surface-2)">
                      {projectName(a.project_id)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Projects */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] glass-dark p-10 md:p-16 text-center"
          >
            <span
              className="mx-auto mb-6 grid place-items-center h-16 w-16 rounded-3xl"
              style={{ background: "rgba(0,113,227,0.14)", border: "1px solid rgba(0,113,227,0.3)" }}
            >
              <Sparkles className="w-7 h-7 text-(--accent-primary)" />
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-(--text-primary) mb-4">
              {t("emptyTitle")}
            </h2>
            <p className="text-(--text-muted) max-w-md mx-auto mb-8">{t("emptyBody")}</p>
            <Link href="/dashboard/new">
              <PremiumButton variant="primary" size="md">
                {t("createFirstProject")}
              </PremiumButton>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-semibold text-(--text-primary)">{t("yourProjects")}</h2>
                <p className="text-sm text-(--text-muted) mt-1">
                  {projects.length === 1
                    ? t("projectCount_one")
                    : t("projectCount_other", { count: projects.length })}
                </p>
              </div>
              <Link href="/dashboard/new">
                <PremiumButton variant="primary" size="md">
                  {t("newProject")}
                </PremiumButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => {
                const whispers = whisperCounts[project.id] ?? 0;
                const accent = project.accent_color || "#0071e3";
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute top-4 right-4 z-20">
                      <ProjectCardMenu
                        project={project}
                        onEdit={(p) => setEditing(p)}
                        onDeleted={handleProjectDeleted}
                      />
                    </div>

                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="relative block overflow-hidden rounded-3xl glass-dark p-6 hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.7)] transition-all duration-300"
                    >
                      <span
                        className="absolute top-0 left-0 right-0 h-0.75 opacity-70"
                        style={{ background: accent }}
                        aria-hidden
                      />
                      <div className="flex items-center gap-2 mb-4 pr-10">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider ${stageColor(
                            project.stage
                          )}`}
                        >
                          {stageLabel(project.stage)}
                        </span>
                        {whispers > 0 && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              background: "rgba(52,216,180,0.14)",
                              border: "1px solid rgba(52,216,180,0.3)",
                              color: "#34d8b4",
                            }}
                          >
                            <MessageSquareDashed className="w-3 h-3" />
                            {whispers}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-(--text-primary) mb-2 line-clamp-1 flex items-center gap-2">
                        {project.emoji && <span>{project.emoji}</span>}
                        {project.name}
                      </h3>

                      {project.description && (
                        <p className="text-sm text-(--text-muted) line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      )}

                      {(briefings[project.id]?.lastDecision || briefings[project.id]?.nextAction) && (
                        <div className="mb-4 space-y-1.5">
                          {briefings[project.id]?.lastDecision && (
                            <p className="text-[12px] text-(--text-muted) line-clamp-1">
                              <span className="text-(--text-dim)">{t("lastDecision")} </span>
                              {briefings[project.id].lastDecision}
                            </p>
                          )}
                          {briefings[project.id]?.nextAction && (
                            <p className="text-[12px] text-(--text-muted) line-clamp-1">
                              <span className="text-(--accent-primary)/80">{t("nextAction")} </span>
                              {briefings[project.id].nextAction}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-(--border)">
                        <span className="text-[10px] font-mono text-(--text-dim) uppercase tracking-wider">
                          {project.sector ?? "—"}
                        </span>
                        <span className="text-[10px] font-mono text-(--text-dim) group-hover:text-(--text-secondary) transition-colors">
                          {new Date(project.created_at).toLocaleDateString()} →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {userEmail && (
              <p className="text-xs font-mono text-(--text-dim) mt-12 text-center">
                {t("loggedInAs")} <span className="text-(--text-secondary)">{userEmail}</span>
              </p>
            )}
          </>
        )}

        <PrivacyReassurance className="mt-12 max-w-md mx-auto" />
      </div>

      <EditProjectModal
        project={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleProjectUpdated}
      />
    </main>
  );
}
