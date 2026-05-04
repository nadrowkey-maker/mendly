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
import type { FileAttachment } from "@/lib/ai/gemini";
import { withFounderContext } from "@/lib/ai/with-founder-context";
import type { Project } from "@/lib/types/project";
import type { Message } from "@/lib/types/conversation";
import type { AgentRole } from "@/lib/types/conversation";
import type { UserProfile } from "@/lib/types/profile";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { PLANS } from "@/lib/stripe/plans";

export const runtime = "nodejs";
export const maxDuration = 60;

export const dynamic = "force-dynamic";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

function getSystemPrompt(
  agentRole: string,
  project: Project,
  locale: "fr" | "en"
) {
  switch (agentRole) {
    case "CTO":
      return buildCtoSystemPrompt(project, locale);
    case "CMO":
      return buildCmoSystemPrompt(project, locale);
    case "CPO":
      return buildCpoSystemPrompt(project, locale);
    case "CFO":
      return buildCfoSystemPrompt(project, locale);
    case "CDO":
      return buildCdoSystemPrompt(project, locale);
    case "DEV":
      return buildDevSystemPrompt(project, locale);
    case "CCO":
      return buildCcoSystemPrompt(project, locale);
    default:
      return buildCeoSystemPrompt(project, locale);
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      conversationId,
      projectId,
      userMessage,
      locale,
      agentRole = "CEO",
      attachments,
    }: {
      conversationId: string;
      projectId: string;
      userMessage: string;
      locale?: string;
      agentRole?: string;
      attachments?: FileAttachment[];
    } = await req.json();

    if (!conversationId || !projectId || !userMessage) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // ============= RATE LIMIT CHECK =============
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "Daily message limit reached",
          used: rateLimit.used,
          limit: rateLimit.limit,
          resetsAt: rateLimit.resetsAt.toISOString(),
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ============= AGENT PLAN CHECK =============
    const allowedAgents: readonly string[] = PLANS[rateLimit.plan].agentsAvailable;
    if (!allowedAgents.includes(agentRole)) {
      return new Response(
        JSON.stringify({ error: "agent_not_available", message: "This agent is not available on your plan" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch project + history + founder profile in parallel
    const [projectRes, historyRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const { data: project, error: projectErr } = projectRes;
    const { data: history } = historyRes;
    const profile = (profileRes.data as UserProfile | null) ?? null;

    if (projectErr || !project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
      });
    }

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    const targetLocale = locale === "en" ? "en" : "fr";
    const baseSystemPrompt = getSystemPrompt(
      agentRole as AgentRole,
      project as Project,
      targetLocale
    );
    const systemPrompt = withFounderContext(baseSystemPrompt, profile, targetLocale);
    const geminiHistory = toGeminiHistory(
      (history ?? []) as Pick<Message, "role" | "content">[]
    );

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGeminiResponse(
            systemPrompt,
            geminiHistory,
            userMessage,
            attachments
          )) {
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
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}