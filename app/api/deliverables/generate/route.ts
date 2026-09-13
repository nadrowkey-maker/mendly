import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePlan } from "@/lib/stripe/plans";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildMendlyMemoPrompt } from "@/lib/ai/prompts/mendly-memo";
import { withFounderContext } from "@/lib/ai/with-founder-context";
import { generateMemoPdf } from "@/lib/pdf/memo";
import type { Project } from "@/lib/types/project";
import type { UserProfile } from "@/lib/types/profile";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for generation

export async function POST(req: NextRequest) {
  try {
    const { projectId, locale } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ============= PLAN CHECK — starter+ only =============
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle();
    const plan = resolvePlan(subData?.plan, subData?.status);
    if (plan === "free") {
      return NextResponse.json({ error: "plan_required", message: "PDF export requires a paid plan" }, { status: 403 });
    }

    const [projectRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const { data: project, error: projectErr } = projectRes;
    const profile = (profileRes.data as UserProfile | null) ?? null;

    if (projectErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Le contexte du mémo : les derniers échanges avec Mendly. La requête visait
    // encore le fil « CEO », vide depuis que Mendly est l'interlocuteur unique —
    // les mémos payants étaient donc rédigés sans jamais lire la conversation.
    const { data: convo } = await supabase
      .from("conversations")
      .select("id")
      .eq("project_id", projectId)
      .eq("agent_role", "MENDLY")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let conversationContext = "";
    if (convo) {
      const { data: messages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (messages && messages.length > 0) {
        conversationContext = messages
          .reverse()
          .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
          .join("\n\n");
      }
    }

    // Generate the memo content
    const targetLocale = locale === "en" ? "en" : "fr";
    const basePrompt = buildMendlyMemoPrompt(
      project as Project,
      conversationContext,
      targetLocale
    );
    const prompt = withFounderContext(basePrompt, profile, targetLocale);

    // Retry up to 3 times if Gemini is overloaded (503)
let result;
let lastError;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    result = await geminiFlash.generateContent(prompt);
    break;
  } catch (err: any) {
    lastError = err;
    if (err?.status === 503 && attempt < 3) {
      console.log(`Gemini 503, retry ${attempt}/3 in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    throw err;
  }
}
if (!result) throw lastError;
const memoMarkdown = result.response.text();

    // Build PDF
    const now = new Date();
    const title =
      targetLocale === "fr"
        ? `Memo stratégique — Semaine du ${now.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}`
        : `Strategic Memo — Week of ${now.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
          })}`;

    const pdfBuffer = generateMemoPdf({
      title,
      agentRole: "CEO",
      projectName: (project as Project).name,
      date: now,
      content: memoMarkdown,
      locale: targetLocale,
    });

    // Upload to Supabase Storage
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const fileName = `${user.id}/${projectId}/mendly-memo-${timestamp}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("deliverables")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Could not save the PDF" },
        { status: 500 }
      );
    }

    // Save deliverable in DB
    const { data: deliverable, error: dbError } = await supabase
      .from("deliverables")
      .insert({
        user_id: user.id,
        project_id: projectId,
        agent_role: "CEO",
        type: "memo",
        title,
        content: memoMarkdown,
        file_path: fileName,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Could not save the deliverable" },
        { status: 500 }
      );
    }

    // Generate signed URL valid for 1 hour
    const { data: signedUrlData } = await supabase.storage
      .from("deliverables")
      .createSignedUrl(fileName, 3600);

    return NextResponse.json({
      success: true,
      deliverable,
      downloadUrl: signedUrlData?.signedUrl ?? null,
    });
  } catch (err) {
    console.error("Memo generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}