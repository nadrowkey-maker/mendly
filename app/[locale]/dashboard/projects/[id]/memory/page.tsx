import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { listProjectActions } from "@/lib/actions/actions";
import { listProjectMemory } from "@/lib/actions/memory";
import { getUserPlan } from "@/lib/actions/subscription";
import { ActionsPanel } from "@/components/project/ActionsPanel";
import { MemoryTimeline } from "@/components/project/MemoryTimeline";
import { ExportButtons } from "@/components/project/ExportButtons";
import type { Project } from "@/lib/types/project";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ProjectMemoryPage({ params }: PageProps) {
  const { id, locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !data) notFound();
  const project = data as Project;

  const [actions, memory, plan, t] = await Promise.all([
    listProjectActions(id),
    listProjectMemory(id),
    getUserPlan(),
    getTranslations("memory"),
  ]);

  const accent = project.accent_color || "#0071e3";

  return (
    <main className="min-h-screen px-6 md:px-10 py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/dashboard/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <header className="mb-10">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase mb-3" style={{ color: accent }}>
            {project.emoji ? `${project.emoji} ` : ""}
            {project.name}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-(--text-primary)">
            {t("title")}
          </h1>
          <p className="mt-3 text-[15px] text-(--text-secondary) leading-relaxed max-w-xl">
            {t("subtitle")}
          </p>
        </header>

        {/* Actions */}
        <section className="mb-8 rounded-[28px] p-6 md:p-7 border border-(--border) bg-(--surface-1)">
          <h2 className="text-lg font-semibold text-(--text-primary) mb-4">{t("actionsTitle")}</h2>
          <ActionsPanel projectId={id} initial={actions} />
        </section>

        {/* Memory timeline */}
        <section className="rounded-[28px] p-6 md:p-7 border border-(--border) bg-(--surface-1)">
          <h2 className="text-lg font-semibold text-(--text-primary) mb-4">{t("timelineTitle")}</h2>
          <MemoryTimeline events={memory} locale={locale} />
        </section>

        {plan === "pro" && (
          <section className="mt-8 rounded-[28px] p-6 md:p-7 border border-(--border) bg-(--surface-1)">
            <h2 className="text-lg font-semibold text-(--text-primary) mb-4">{t("exportsTitle")}</h2>
            <ExportButtons projectId={id} />
          </section>
        )}
      </div>
    </main>
  );
}
