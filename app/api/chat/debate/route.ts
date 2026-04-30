import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import {
  buildCtoDebatePrompt,
  buildCmoDebatePrompt,
  buildCeoSynthesisPrompt,
} from "@/lib/ai/prompts/debate";
import { checkRateLimit } from "@/lib/rate-limit/check";
import type { Project } from "@/lib/types/project";

export const runtime = "nodejs";
export const maxDuration = 90;

/**
 * Streams 3 sequential agent rounds: CTO → CMO → CEO synthesis.
 * Each round delimited by [[ROUND:XXX]] markers parsed by the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    const { projectId, conversationId, userMessage, locale } = await req.json();

    if (!projectId || !conversationId || !userMessage) {
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

    // Fetch project
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (projectErr || !project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
      });
    }

    // Save user message FIRST (counts toward rate limit)
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    const targetLocale: "fr" | "en" = locale === "en" ? "en" : "fr";
    const projectTyped = project as Project;
    const previousRounds: { agent: string; content: string }[] = [];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ===== ROUND 1: CTO =====
          controller.enqueue(encoder.encode("[[ROUND:CTO]]"));

          const ctoPrompt = buildCtoDebatePrompt({
            project: projectTyped,
            userQuestion: userMessage,
            previousRounds,
            locale: targetLocale,
          });

          const ctoResult = await geminiFlash.generateContentStream(ctoPrompt);
          let ctoFull = "";
          for await (const chunk of ctoResult.stream) {
            const text = chunk.text();
            if (text) {
              ctoFull += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          previousRounds.push({ agent: "CTO", content: ctoFull });

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            agent_role: "CTO",
            content: ctoFull,
          });

          // ===== ROUND 2: CMO =====
          controller.enqueue(encoder.encode("[[ROUND:CMO]]"));

          const cmoPrompt = buildCmoDebatePrompt({
            project: projectTyped,
            userQuestion: userMessage,
            previousRounds,
            locale: targetLocale,
          });

          const cmoResult = await geminiFlash.generateContentStream(cmoPrompt);
          let cmoFull = "";
          for await (const chunk of cmoResult.stream) {
            const text = chunk.text();
            if (text) {
              cmoFull += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          previousRounds.push({ agent: "CMO", content: cmoFull });

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            agent_role: "CMO",
            content: cmoFull,
          });

          // ===== ROUND 3: CEO Synthesis =====
          controller.enqueue(encoder.encode("[[ROUND:CEO]]"));

          const ceoPrompt = buildCeoSynthesisPrompt({
            project: projectTyped,
            userQuestion: userMessage,
            previousRounds,
            locale: targetLocale,
          });

          const ceoResult = await geminiFlash.generateContentStream(ceoPrompt);
          let ceoFull = "";
          for await (const chunk of ceoResult.stream) {
            const text = chunk.text();
            if (text) {
              ceoFull += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            agent_role: "CEO",
            content: ceoFull,
          });

          // Update conversation timestamp
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          controller.enqueue(encoder.encode("[[ROUND:END]]"));
          controller.close();
        } catch (err) {
          console.error("Debate streaming error:", err);
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
    console.error("Debate route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}