import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { listProjects } from "@/lib/actions/projects";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  // Server-side data fetch
  const projects = await listProjects();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardClient
      projects={projects}
      userEmail={user?.email ?? null}
    />
  );
}