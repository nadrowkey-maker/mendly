/**
 * Cron endpoint (Bloc 6.3.3) — runs daily.
 * 30 days after a major decision, the team debriefs it: what likely worked,
 * what was risky, and one concrete adjustment. Pro only. Stored as a memory
 * event so it shows up in the project's Memory timeline.
 *
 * Security: only callable with a valid CRON_SECRET Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geminiFlash } from "@/lib/ai/gemini";

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
  let processed = 0;

  try {
    const { data: proUsers } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("plan", "pro")
      .eq("status", "active");
    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: "No pro users", processed: 0 });
    }
    const proIds = new Set(proUsers.map((u) => u.user_id));

    // Decisions taken ~30 days ago (28–31 day window).
    const from = new Date();
    from.setDate(from.getDate() - 31);
    const to = new Date();
    to.setDate(to.getDate() - 28);

    const { data: decisions } = await supabase
      .from("memory_events")
      .select("id, user_id, project_id, title, detail")
      .eq("kind", "decision")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .limit(50);

    for (const dec of decisions ?? []) {
      if (!proIds.has(dec.user_id)) continue;
      const label = (dec.title ?? dec.detail ?? "décision").slice(0, 60);

      // Dedup: skip if a post-mortem already exists for this decision.
      const { data: existing } = await supabase
        .from("memory_events")
        .select("id")
        .eq("project_id", dec.project_id)
        .eq("kind", "milestone")
        .ilike("title", `Post-mortem: ${label.slice(0, 20)}%`)
        .limit(1);
      if (existing && existing.length > 0) continue;

      const { data: project } = await supabase.from("projects").select("name").eq("id", dec.project_id).single();

      const prompt = `Il y a 30 jours, cette décision a été prise pour le projet "${project?.name ?? ""}" : "${dec.title ?? dec.detail}".
Rédige un POST-MORTEM court (150 mots max) : ce qui a probablement bien marché, ce qui était risqué, et UN ajustement concret à faire maintenant. Honnête, sans reproche, tutoie.`;

      let content = "";
      try {
        content = (await geminiFlash.generateContent(prompt)).response.text();
      } catch (e) {
        console.error("[post-mortems] gemini error:", e);
        continue;
      }
      if (!content) continue;

      await supabase.from("memory_events").insert({
        user_id: dec.user_id,
        project_id: dec.project_id,
        kind: "milestone",
        title: `Post-mortem: ${label}`,
        detail: content,
      });
      processed += 1;
    }

    return NextResponse.json({ success: true, processed });
  } catch (err) {
    console.error("[post-mortems] fatal error:", err);
    return NextResponse.json(
      { error: "Cron failed", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
