/**
 * Cron endpoint (Bloc 6.3.4 / 3.2 Phase 2) — runs daily.
 * If a Pro founder goes quiet for ~5 days while open actions remain, the team
 * sends ONE gentle nudge ("ça fait quelques jours, qu'est-ce qui bloque ?").
 * Caring pressure, never blame. Fires once (5–6 day window) so it never spams.
 *
 * Security: only callable with a valid CRON_SECRET Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

function getAdminSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  let sent = 0;

  try {
    const { data: proUsers } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("plan", "pro")
      .eq("status", "active");
    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: "No pro users", sent: 0 });
    }

    for (const sub of proUsers) {
      try {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("created_at")
          .eq("user_id", sub.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!lastMsg) continue;

        const days = (Date.now() - new Date(lastMsg.created_at).getTime()) / 86_400_000;
        // 1-day firing window so the nudge is sent ~once per quiet spell.
        if (days < 5 || days >= 6) continue;

        const { data: openActions } = await supabase
          .from("actions")
          .select("content")
          .eq("user_id", sub.user_id)
          .eq("status", "todo")
          .limit(3);
        if (!openActions || openActions.length === 0) continue;

        const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
        const email = userData?.user?.email;
        if (!email) continue;

        const actionsHtml = openActions.map((a) => `<li style="margin-bottom:6px;">${a.content}</li>`).join("");

        // Point 2 — ce que l'équipe a produit PENDANT l'absence. La relance ne
        // parlait que de l'inactivité du fondateur ; elle peut désormais lui
        // dire ce qui l'attend, ce qui change un rappel en raison de revenir.
        const { data: teamWork } = await supabase
          .from("debates")
          .select("question")
          .eq("user_id", sub.user_id)
          .eq("origin", "autonomous")
          .gte("created_at", lastMsg.created_at)
          .is("seen_at", null)
          .order("created_at", { ascending: false })
          .limit(3);

        const sessions = teamWork ?? [];
        const teamWorkHtml = sessions.length
          ? `<p style="line-height:1.7;">Pendant ce temps, on a continué à bosser sur ton projet :</p>
               <ul style="line-height:1.7;color:#111;">${sessions
                 .map((d) => `<li style="margin-bottom:6px;">${d.question}</li>`)
                 .join("")}</ul>`
          : "";

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY! },
          body: JSON.stringify({
            sender: { email: process.env.BREVO_SENDER_EMAIL ?? "contact@mendlyai.io", name: process.env.BREVO_SENDER_NAME ?? "Mendly" },
            to: [{ email }],
            subject: sessions.length ? "On a avancé pendant ton absence" : "Ton équipe pense à toi",
            htmlContent: `
              <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333;padding:24px;">
                <h1 style="font-size:20px;">Ça fait quelques jours — qu'est-ce qui bloque ?</h1>
                <p style="line-height:1.7;">Pas de reproche. On voulait juste reprendre là où on s'était arrêtés. Tu avais ces actions en cours :</p>
                <ul style="line-height:1.7;color:#111;">${actionsHtml}</ul>
                ${teamWorkHtml}
                <p style="line-height:1.7;">Si l'une d'elles est trop lourde, on la découpe ensemble en quelque chose de réaliste.</p>
                <a href="https://www.mendlyai.io/fr/dashboard"
                   style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0A0A0A;color:white;text-decoration:none;border-radius:999px;font-weight:bold;">
                  Reprendre avec mon équipe →
                </a>
                <p style="margin-top:32px;font-size:11px;color:#999;">Mendly · pression bienveillante, jamais culpabilisante</p>
              </div>
            `,
          }),
        });
        sent += 1;
      } catch (e) {
        console.error(`[nudges] error for user ${sub.user_id}:`, e);
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("[nudges] fatal error:", err);
    return NextResponse.json(
      { error: "Cron failed", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
