import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSeenOnboarding } from "@/lib/actions/profile";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Welcome · Mendly",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (await hasSeenOnboarding()) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
