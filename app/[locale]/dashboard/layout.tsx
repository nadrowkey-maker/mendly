import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSeenOnboarding } from "@/lib/actions/profile";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const seen = await hasSeenOnboarding();
  if (!seen) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}