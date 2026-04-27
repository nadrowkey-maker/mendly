import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildCeoMemoPrompt } from "@/lib/ai/prompts/ceo-memo";
import { generateMemoPdf } from "@/lib/pdf/memo";
import type { Project } from "@/lib/types/project";

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

    // Fetch project (RLS check)
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch recent conversation context (last 10 messages from CEO conversation)
    const { data: convo } = await supabase
      .from("conversations")
      .select("id")
      .eq("project_id", projectId)
      .eq("agent_role", "CEO")
      .eq("user_id", user.id)
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
    const prompt = buildCeoMemoPrompt(
      project as Project,
      conversationContext,
      targetLocale
    );

    const result = await geminiFlash.generateContent(prompt);
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
    const fileName = `${user.id}/${projectId}/ceo-memo-${timestamp}.pdf`;

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