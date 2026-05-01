import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/actions/profile";
import { getUserSubscription } from "@/lib/actions/subscription";
import { hasActiveSubscription } from "@/lib/actions/account";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = {
  title: "Settings · Mendly",
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

  const [profile, subscription, subStatus] = await Promise.all([
    getUserProfile(),
    getUserSubscription(),
    hasActiveSubscription(),
  ]);

  return (
    <SettingsClient
      userEmail={user.email ?? ""}
      profile={profile}
      subscriptionPlan={subscription.plan}
      subscriptionStatus={subscription.status}
      hasActiveSubscription={subStatus.hasActive}
    />
  );
}
