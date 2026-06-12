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

          // Durable project state for the recap (decisions made, open actions).
          const [actionsRes, decisionsRes] = await Promise.all([
            supabase.from("actions").select("content").eq("project_id", project.id).eq("status", "todo").limit(10),
            supabase
              .from("memory_events")
              .select("title, kind")
              .eq("project_id", project.id)
              .gte("created_at", sevenDaysAgo.toISOString())
              .limit(10),
          ]);
          const actionsStr =
            (actionsRes.data ?? []).map((a) => `- ${a.content}`).join("\n") || "(aucune action en cours)";
          const decisionsStr =
            (decisionsRes.data ?? []).map((d) => `- [${d.kind}] ${d.title}`).join("\n") ||
            "(aucune décision enregistrée)";

          const prompt = isPro
            ? `Tu es le CEO de ${project.name}. Rédige le memo hebdomadaire ENRICHI du fondateur — version "vraie réunion de direction" (350 mots max). Formulation NON datée ("voici tes priorités pour la semaine", jamais "aujourd'hui").

CONVERSATIONS DE LA SEMAINE :
${transcript}

DÉCISIONS RÉCENTES :
${decisionsStr}

ACTIONS EN COURS :
${actionsStr}

STRUCTURE :
1. **Bilan de la semaine** (2-3 phrases, honnête)
2. **Analyse des risques** (2 risques + comment les mitiger)
3. **Recommandations proactives** (2 angles que le fondateur ne voit peut-être pas)
4. **Tes 3 priorités pour la semaine** (bullets exécutables)
5. **Suivi des actions** : reviens sur les actions en cours, sans reproche ; si bloqué, propose une version plus réaliste.

Direct, dense, sans remplissage. Tutoie.`
            : `Tu es le CEO de ${project.name}. Rédige un memo hebdomadaire BASIQUE pour le fondateur (180 mots max). Formulation NON datée ("voici où on en est", jamais "aujourd'hui").

CONVERSATIONS DE LA SEMAINE :
${transcript}

DÉCISIONS RÉCENTES :
${decisionsStr}

ACTIONS EN COURS :
${actionsStr}

STRUCTURE :
1. **Décisions prises cette semaine** (1-2 phrases)
2. **Actions en cours / ce qui reste à faire** (bullets)
3. **Tes priorités pour la semaine** (3 max)

Punchy, direct, exécutable. Pas de blabla. Tutoie.`;

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
                sender: { email: "nadroleboss@gmail.com", name: "Mendly" },
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
