import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCeoSystemPrompt } from "@/lib/ai/agents/ceo";
import { buildCtoSystemPrompt } from "@/lib/ai/agents/cto";
import { buildCmoSystemPrompt } from "@/lib/ai/agents/cmo";
import { buildCpoSystemPrompt } from "@/lib/ai/agents/cpo";
import { buildCfoSystemPrompt } from "@/lib/ai/agents/cfo";
import { buildCdoSystemPrompt } from "@/lib/ai/agents/cdo";
import { buildDevSystemPrompt } from "@/lib/ai/agents/dev";
import { buildCcoSystemPrompt } from "@/lib/ai/agents/cco";
import { streamGeminiResponse, toGeminiHistory } from "@/lib/ai/gemini";
import type { Project } from "@/lib/types/project";
import type { Message } from "@/lib/types/conversation";
import type { AgentRole } from "@/lib/types/conversation";

export const runtime = "nodejs";

function getSystemPrompt(agentRole: string, project: Project, locale: "fr" | "en") {
    switch (agentRole) {
      case "CTO": return buildCtoSystemPrompt(project, locale);
      case "CMO": return buildCmoSystemPrompt(project, locale);
      case "CPO": return buildCpoSystemPrompt(project, locale);
      case "CFO": return buildCfoSystemPrompt(project, locale);
      case "CDO": return buildCdoSystemPrompt(project, locale);
      case "DEV": return buildDevSystemPrompt(project, locale);
      case "CCO": return buildCcoSystemPrompt(project, locale);
      default: return buildCeoSystemPrompt(project, locale);
    }
  }

export async function POST(req: NextRequest) {
  try {
    const { conversationId, projectId, userMessage, locale, agentRole = "CEO" } = await req.json();

    if (!conversationId || !projectId || !userMessage) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectErr || !project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    const targetLocale = locale === "en" ? "en" : "fr";
    const systemPrompt = getSystemPrompt(agentRole as AgentRole, project as Project, targetLocale);
    const geminiHistory = toGeminiHistory(
      (history ?? []) as Pick<Message, "role" | "content">[]
    );

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGeminiResponse(systemPrompt, geminiHistory, userMessage)) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            agent_role: agentRole,
            content: fullResponse,
          });

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}