import { redirect } from "next/navigation";
import { listProjects } from "@/lib/actions/projects";
import { listOpenActions, getProjectBriefings } from "@/lib/actions/actions";
import { getUnreadWhisperCountsByProject } from "@/lib/actions/whispers";
import { getDashboardStats } from "@/lib/actions/dashboard-stats";
import { getUserSubscription } from "@/lib/actions/subscription";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // La disposition parente redirige déjà les visiteurs anonymes ; ce garde-fou
  // sert au typage et couvre le cas où la page serait rendue hors de sa
  // disposition.
  if (!user) {
    redirect("/login");
  }

  const [projects, openActions, whisperCounts, briefings, stats, subscription, usage] =
    await Promise.all([
      listProjects(),
      listOpenActions(8),
      getUnreadWhisperCountsByProject(),
      getProjectBriefings(),
      getDashboardStats(),
      getUserSubscription(),
      checkRateLimit(user.id),
    ]);

  return (
    <DashboardClient
      projects={projects}
      userEmail={user.email ?? null}
      openActions={openActions}
      whisperCounts={whisperCounts}
      briefings={briefings}
      stats={stats}
      userPlan={subscription.plan}
      usageUsed={usage.used}
      usageLimit={usage.limit}
    />
  );
}
