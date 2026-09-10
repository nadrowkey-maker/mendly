import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/actions/profile";
import { getUserSubscription } from "@/lib/actions/subscription";
import { hasActiveSubscription } from "@/lib/actions/account";
import { listProjects } from "@/lib/actions/projects";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = {
  title: "Paramètres · Mendly",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, subscription, subStatus, projects, usage] = await Promise.all([
    getUserProfile(),
    getUserSubscription(),
    hasActiveSubscription(),
    listProjects(),
    checkRateLimit(user.id),
  ]);

  return (
    <SettingsClient
      userEmail={user.email ?? ""}
      profile={profile}
      subscriptionPlan={subscription.plan}
      subscriptionStatus={subscription.status}
      hasActiveSubscription={subStatus.hasActive}
      projects={projects}
      usageUsed={usage.used}
      usageLimit={usage.limit}
    />
  );
}
