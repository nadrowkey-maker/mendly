import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { selectAgents } from "@/lib/ai/debate/selector";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { question, projectId, locale = "fr" } = (await req.json()) as {
      question: string;
      projectId: string;
      locale?: string;
    };

    if (!question || !projectId) {
      return NextResponse.json({ error: "Missing question or projectId" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const selection = await selectAgents({
      question,
      project,
      locale: locale === "en" ? "en" : "fr",
    });

    return NextResponse.json(selection);
  } catch (err) {
    console.error("[select-agents]", err);
    return NextResponse.json({ error: "Selector failed" }, { status: 500 });
  }
}
