"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ProjectCardMenu } from "@/components/dashboard/ProjectCardMenu";
import { EditProjectModal } from "@/components/dashboard/EditProjectModal";
import type { Project } from "@/lib/types/project";

interface DashboardClientProps {
  projects: Project[];
  userEmail: string | null;
}

export function DashboardClient({
  projects: initialProjects,
  userEmail,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [, startTransition] = useTransition();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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
      scaling: "text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/5",
    };
    return map[stage] ?? "text-(--text-muted) border-(--border)";
  };

  const handleProjectDeleted = (projectId: string) => {
    startTransition(() => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    });
  };

  const handleProjectUpdated = (updated: Project) => {
    startTransition(() => {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });
  };

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-1">
              MENDLY
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("welcome")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors"
            >
              {t("settings")}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors"
            >
              {t("signOut")}
            </button>
          </div>
        </div>

        {/* Projects section */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-10 md:p-16 text-center"
          >
            <div className="text-6xl mb-6" role="img" aria-label="Empty">
              🚀
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t("emptyTitle")}
            </h2>
            <p className="text-(--text-muted) max-w-md mx-auto mb-8">
              {t("emptyBody")}
            </p>

            {userEmail && (
              <p className="text-xs font-mono text-(--text-dim) mb-8">
                {t("loggedInAs")}{" "}
                <span className="text-(--accent-glow)">{userEmail}</span>
              </p>
            )}

            <Link href="/dashboard/new">
              <PremiumButton variant="primary" size="md">
                {t("createFirstProject")}
              </PremiumButton>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t("yourProjects")}
                </h2>
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
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative group"
                >
                  {/* Menu sits above the link */}
                  <div className="absolute top-4 right-4 z-20">
                    <ProjectCardMenu
                      project={project}
                      onEdit={(p) => setEditing(p)}
                      onDeleted={handleProjectDeleted}
                    />
                  </div>

                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="block rounded-2xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 hover:border-(--accent-glow)/50 hover:bg-(--surface)/60 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider ${stageColor(
                          project.stage
                        )}`}
                      >
                        {stageLabel(project.stage)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="text-sm text-(--text-muted) line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-(--border)">
                      <span className="text-[10px] font-mono text-(--text-dim) uppercase tracking-wider">
                        {project.sector ?? "—"}
                      </span>
                      <span className="text-[10px] font-mono text-(--text-dim) group-hover:text-(--accent-glow) transition-colors">
                        {new Date(project.created_at).toLocaleDateString()} →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {userEmail && (
              <p className="text-xs font-mono text-(--text-dim) mt-12 text-center">
                {t("loggedInAs")}{" "}
                <span className="text-(--accent-glow)">{userEmail}</span>
              </p>
            )}
          </>
        )}
      </div>

      <EditProjectModal
        project={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleProjectUpdated}
      />
    </main>
  );
}
