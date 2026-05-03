import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import {
  buildCtoDebatePrompt,
  buildCmoDebatePrompt,
  buildCeoSynthesisPrompt,
} from "@/lib/ai/prompts/debate";
import { withFounderContext } from "@/lib/ai/with-founder-context";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { PLANS } from "@/lib/stripe/plans";
import type { Project } from "@/lib/types/project";
import type { UserProfile } from "@/lib/types/profile";

export const runtime = "nodejs";
export const maxDuration = 90;

async function streamWithRetry(prompt: string, retries = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await geminiFlash.generateContentStream(prompt);
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

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

    // ============= DEBATE PLAN CHECK =============
    if (!PLANS[rateLimit.plan].debateEnabled) {
      return new Response(
        JSON.stringify({ error: "plan_required", message: "Debate is not available on your plan" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
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

    const targetLocale: "fr" | "en" = locale === "en" ? "en" : "fr";
    const projectTyped = project as Project;
    const previousRounds: { agent: string; content: string }[] = [];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ===== ROUND 1: CTO =====
          controller.enqueue(encoder.encode("[[ROUND:CTO]]"));

          const ctoPrompt = withFounderContext(
            buildCtoDebatePrompt({
              project: projectTyped,
              userQuestion: userMessage,
              previousRounds,
              locale: targetLocale,
            }),
            profile,
            targetLocale
          );

          const ctoResult = await streamWithRetry(ctoPrompt);
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

          const cmoPrompt = withFounderContext(
            buildCmoDebatePrompt({
              project: projectTyped,
              userQuestion: userMessage,
              previousRounds,
              locale: targetLocale,
            }),
            profile,
            targetLocale
          );

          const cmoResult = await streamWithRetry(cmoPrompt);
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

          const ceoPrompt = withFounderContext(
            buildCeoSynthesisPrompt({
              project: projectTyped,
              userQuestion: userMessage,
              previousRounds,
              locale: targetLocale,
            }),
            profile,
            targetLocale
          );

          const ceoResult = await streamWithRetry(ceoPrompt);
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
          const is503 = (err as { status?: number })?.status === 503;
          const msg = is503
            ? "\n\n*Gemini is overloaded right now. Please try again in a moment.*"
            : "\n\n*An error occurred. Please try again.*";
          try {
            controller.enqueue(encoder.encode(msg));
            controller.enqueue(encoder.encode("[[ROUND:END]]"));
            controller.close();
          } catch {
            // stream already closed
          }
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