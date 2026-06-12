import { listProjects } from "@/lib/actions/projects";
import { listOpenActions, getProjectBriefings } from "@/lib/actions/actions";
import { getUnreadWhisperCountsByProject } from "@/lib/actions/whispers";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const [projects, openActions, whisperCounts, briefings] = await Promise.all([
    listProjects(),
    listOpenActions(8),
    getUnreadWhisperCountsByProject(),
    getProjectBriefings(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardClient
      projects={projects}
      userEmail={user?.email ?? null}
      openActions={openActions}
      whisperCounts={whisperCounts}
      briefings={briefings}
    />
  );
}
