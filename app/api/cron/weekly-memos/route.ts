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
    const { data: proUsers, error: usersErr } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("plan", "pro")
      .eq("status", "active");

    if (usersErr) throw usersErr;
    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: "No Pro users", count: 0 });
    }

    for (const sub of proUsers) {
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

          const { data: messages } = await supabase
            .from("messages")
            .select("role, agent_role, content")
            .eq("user_id", sub.user_id)
            .gte("created_at", sevenDaysAgo.toISOString())
            .order("created_at", { ascending: true })
            .limit(50);

          if (!messages || messages.length === 0) continue;

          const transcript = messages
            .map((m) => `[${m.role === "user" ? "FOUNDER" : (m.agent_role ?? "ASSISTANT")}]\n${m.content}`)
            .join("\n\n");

          const prompt = `Tu es le CEO de ${project.name}. C'est lundi matin. Tu dois envoyer au fondateur un memo hebdomadaire (200 mots MAX) qui synthétise la semaine.

CONVERSATIONS DE LA SEMAINE :
${transcript}

STRUCTURE DU MEMO :
1. **Ce qui s'est passé cette semaine** (1-2 phrases)
2. **Ton observation clé** en tant que CEO
3. **Tes 3 priorités pour la semaine prochaine** (bullets, 3 max)

Sois punchy, direct, exécutable. Pas de blabla. Le fondateur n'a pas le temps.

Maintenant écris le memo (200 mots max) :`;

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
                sender: { email: "hello@mendly.ai", name: "Mendly" },
                to: [{ email: userData.user.email }],
                subject: `Ton memo hebdo · ${project.name}`,
                htmlContent: `
                  <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333;padding:24px;">
                    <h1 style="font-size:18px;color:#7C3AED;">Memo Hebdomadaire</h1>
                    <h2 style="font-size:22px;margin-top:8px;">${project.name}</h2>
                    <div style="margin-top:24px;line-height:1.7;white-space:pre-wrap;">${memoContent.replace(/\n/g, "<br>")}</div>
                    <a href="https://mendly-cre3.vercel.app/fr/dashboard/projects/${project.id}"
                       style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0A0A0A;color:white;text-decoration:none;border-radius:999px;font-weight:bold;">
                      Voir le projet →
                    </a>
                    <p style="margin-top:32px;font-size:11px;color:#999;">Envoyé chaque lundi par ton CEO IA · Mendly</p>
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
