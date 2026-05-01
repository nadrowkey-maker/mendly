import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendTransactionalEmail,
  buildWeeklyRecapHtml,
} from "@/lib/email/brevo";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mendly.co";

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: deliverables, error } = await supabase
    .from("deliverables")
    .select("id, user_id, project_id, title, agent_role, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Weekly recap: deliverables query failed", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!deliverables?.length) {
    return NextResponse.json({ sent: 0, message: "No deliverables this week" });
  }

  // Group by user_id
  const byUser = deliverables.reduce<
    Record<string, typeof deliverables>
  >((acc, d) => {
    if (!acc[d.user_id]) acc[d.user_id] = [];
    acc[d.user_id].push(d);
    return acc;
  }, {});

  let sent = 0;
  const errors: string[] = [];

  for (const [userId, userDeliverables] of Object.entries(byUser)) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      if (!email) continue;

      // Get the project name for the first deliverable (most recent)
      const projectId = userDeliverables[0].project_id;
      const { data: project } = await supabase
        .from("projects")
        .select("name")
        .eq("id", projectId)
        .maybeSingle();

      const projectName = project?.name ?? "your project";
      const userName = userData.user.user_metadata?.full_name ?? "";

      const html = buildWeeklyRecapHtml({
        userName,
        projectName,
        deliverables: userDeliverables.map((d) => ({
          title: d.title,
          agent_role: d.agent_role,
          created_at: d.created_at,
        })),
        locale: "fr",
        dashboardUrl: `${appUrl}/dashboard`,
      });

      await sendTransactionalEmail({
        to: [{ email, name: userName || undefined }],
        subject: `Mendly · Ton récap de la semaine — ${projectName}`,
        htmlContent: html,
        textContent: `Mendly — ${userDeliverables.length} livrable(s) cette semaine pour ${projectName}. Voir : ${appUrl}/dashboard`,
      });

      sent++;
    } catch (err) {
      console.error(`Weekly recap: failed for user ${userId}`, err);
      errors.push(userId);
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
