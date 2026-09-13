/**
 * Cron endpoint — runs every Monday at 9am UTC.
 * Generates a weekly memo for each Pro user's active projects
 * and sends it via Brevo email.
 *
 * Triggered by Vercel Cron (configured in vercel.json).
 * Security: only callable with valid CRON_SECRET Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildWeeklyMemoPrompt } from "@/lib/ai/prompts/mendly-memo";

export const runtime = "nodejs";
export const maxDuration = 300;

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const results: { userId: string; ok: boolean; error?: string }[] = [];

  try {
    const { data: payingUsers, error: usersErr } = await supabase
      .from("subscriptions")
      .select("user_id, plan")
      .in("plan", ["starter", "pro"])
      .eq("status", "active");

    if (usersErr) throw usersErr;
    if (!payingUsers || payingUsers.length === 0) {
      return NextResponse.json({ message: "No paying users", count: 0 });
    }

    for (const sub of payingUsers) {
      const isPro = sub.plan === "pro";
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
        if (!userData?.user?.email) continue;

        const { data: projects } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", sub.user_id);

        if (!projects || projects.length === 0) continue;

        for (const project of projects.slice(0, 3)) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          // Les messages sont lus dans les fils de CE projet. La requête ne
          // filtrait que par utilisateur : le mémo d'un projet résumait aussi
          // les conversations de tous les autres.
          const { data: threads } = await supabase
            .from("conversations")
            .select("id")
            .eq("project_id", project.id);
          const threadIds = (threads ?? []).map((c) => (c as { id: string }).id);
          if (threadIds.length === 0) continue;

          const { data: messages } = await supabase
            .from("messages")
            .select("role, agent_role, content")
            .in("conversation_id", threadIds)
            .eq("user_id", sub.user_id)
            .gte("created_at", sevenDaysAgo.toISOString())
            .order("created_at", { ascending: true })
            .limit(50);

          if (!messages || messages.length === 0) continue;

          const transcript = messages
            .map((m) => `[${m.role === "user" ? "FOUNDER" : (m.agent_role ?? "ASSISTANT")}]\n${m.content}`)
            .join("\n\n");

          // Durable project state for the recap (decisions made, open actions).
          const [actionsRes, decisionsRes, teamWorkRes] = await Promise.all([
            supabase.from("actions").select("content").eq("project_id", project.id).eq("status", "todo").limit(10),
            supabase
              .from("memory_events")
              .select("title, kind")
              .eq("project_id", project.id)
              .gte("created_at", sevenDaysAgo.toISOString())
              .limit(10),
            supabase
              .from("debates")
              .select("question, verdict")
              .eq("project_id", project.id)
              .eq("origin", "autonomous")
              .gte("created_at", sevenDaysAgo.toISOString())
              .limit(3),
          ]);
          const actionsStr =
            (actionsRes.data ?? []).map((a) => `- ${a.content}`).join("\n") || "(aucune action en cours)";
          const decisionsStr =
            (decisionsRes.data ?? []).map((d) => `- [${d.kind}] ${d.title}`).join("\n") ||
            "(aucune décision enregistrée)";
          // Point 2 — ce que l'équipe a produit seule pendant la semaine.
          const teamWorkStr = (teamWorkRes.data ?? [])
            .map((d) => `- ${d.question}\n  -> ${(d.verdict ?? "").slice(0, 400)}`)
            .join("\n\n");

          const prompt = buildWeeklyMemoPrompt({
            project,
            transcript,
            decisions: decisionsStr,
            actions: actionsStr,
            teamWork: teamWorkStr || undefined,
            isPro,
          });

          let memoContent = "";
          try {
            const result = await geminiFlash.generateContent(prompt);
            memoContent = result.response.text();
          } catch (genErr) {
            console.error(`[weekly-memos] Gemini error for project ${project.id}:`, genErr);
            continue;
          }

          if (!memoContent) continue;

          await supabase.from("weekly_memos").insert({
            user_id: sub.user_id,
            project_id: project.id,
            content: memoContent,
            email_status: "pending",
          });

          try {
            const brevoResp = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY!,
              },
              body: JSON.stringify({
                sender: { email: process.env.BREVO_SENDER_EMAIL ?? "contact@mendlyai.io", name: process.env.BREVO_SENDER_NAME ?? "Mendly" },
                to: [{ email: userData.user.email }],
                subject: `Ton memo hebdo · ${project.name}`,
                htmlContent: `
                  <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333;padding:24px;">
                    <h1 style="font-size:18px;color:#3AA8FF;">Memo Hebdomadaire</h1>
                    <h2 style="font-size:22px;margin-top:8px;">${project.name}</h2>
                    <div style="margin-top:24px;line-height:1.7;white-space:pre-wrap;">${memoContent.replace(/\n/g, "<br>")}</div>
                    <a href="https://www.mendlyai.io/fr/dashboard/projects/${project.id}"
                       style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0A0A0A;color:white;text-decoration:none;border-radius:999px;font-weight:bold;">
                      Voir le projet →
                    </a>
                    <p style="margin-top:32px;font-size:11px;color:#999;">Envoyé chaque lundi par Mendly</p>
                  </div>
                `,
              }),
            });

            const newStatus = brevoResp.ok ? "sent" : "failed";
            await supabase
              .from("weekly_memos")
              .update({ email_status: newStatus })
              .eq("user_id", sub.user_id)
              .eq("project_id", project.id)
              .eq("email_status", "pending");
          } catch (emailErr) {
            console.error("[weekly-memos] Email send error:", emailErr);
          }
        }

        results.push({ userId: sub.user_id, ok: true });
      } catch (userErr) {
        console.error(`[weekly-memos] Error for user ${sub.user_id}:`, userErr);
        results.push({
          userId: sub.user_id,
          ok: false,
          error: userErr instanceof Error ? userErr.message : "Unknown",
        });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("[weekly-memos] fatal error:", err);
    return NextResponse.json(
      { error: "Cron failed", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
