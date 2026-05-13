import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { PLANS } from "@/lib/stripe/plans";
import { selectAgents } from "@/lib/ai/debate/selector";
import { buildThreadTurnPrompt } from "@/lib/ai/debate/orchestrator";
import { buildCeoCallPrompt } from "@/lib/ai/debate/synthesizer";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

export const runtime = "nodejs";
export const maxDuration = 120;

function parseRetryDelay(err: unknown): number | null {
  const details = (err as { errorDetails?: { "@type"?: string; retryDelay?: string }[] })?.errorDetails;
  if (!Array.isArray(details)) return null;
  for (const d of details) {
    if (d["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && d.retryDelay) {
      const secs = parseFloat(d.retryDelay);
      if (!isNaN(secs)) return secs * 1000;
    }
  }
  return null;
}

async function streamAgent(prompt: string): Promise<{ stream: AsyncIterable<{ text(): string }> }> {
  let lastErr: unknown;
  for (let i = 1; i <= 3; i++) {
    try {
      return await geminiFlash.generateContentStream(prompt);
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if ((status === 503 || status === 429) && i < 3) {
        const delay = parseRetryDelay(err) ?? (status === 429 ? 20_000 : 2000 * i);
        await new Promise((r) => setTimeout(r, Math.min(delay, 30_000)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, projectId, userMessage, locale } =
      (await req.json()) as {
        conversationId: string;
        projectId: string;
        userMessage: string;
        locale?: string;
      };

    if (!conversationId || !projectId || !userMessage) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "rate_limited", used: rateLimit.used, limit: rateLimit.limit }),
        { status: 429 }
      );
    }

    if (!PLANS[rateLimit.plan].debateEnabled) {
      return new Response(
        JSON.stringify({ error: "plan_required", message: "Debate is not available on your plan" }),
        { status: 403 }
      );
    }

    const { data: projectData, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectErr || !projectData) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const project = projectData as Project;
    const targetLocale: "fr" | "en" = locale === "en" ? "en" : "fr";
    const encoder = new TextEncoder();
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        const write = (s: string) => {
          if (cancelled) return;
          try {
            controller.enqueue(encoder.encode(s));
          } catch {
            // stream closed
          }
        };

        try {
          // Save user message
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "user",
            content: userMessage,
          });

          // Select agents
          const selection = await selectAgents({
            question: userMessage,
            project,
            locale: targetLocale,
          });

          write(`[[META]]${JSON.stringify(selection)}[[/META]]`);

          // Thread: interleaved passes — each agent speaks 2-3 times, short messages
          const thread: { agent: DebateAgentRole; content: string }[] = [];
          // 2 agents → 3 passes each (6 messages); 3-4 agents → 2 passes each
          const numPasses = selection.agents.length <= 2 ? 3 : 2;

          write("[[THREAD]]");

          for (let pass = 1; pass <= numPasses; pass++) {
            for (const agent of selection.agents) {
              if (cancelled) break;

              write(`[[TURN:${agent}]]`);

              const prompt = buildThreadTurnPrompt({
                agent,
                question: userMessage,
                previousTurns: [...thread],
                project,
                locale: targetLocale,
                pass,
                totalPasses: numPasses,
              });

              let content = "";
              try {
                const result = await streamAgent(prompt);
                for await (const chunk of result.stream) {
                  if (cancelled) break;
                  const text = chunk.text();
                  if (text) { content += text; write(text); }
                }
              } catch (err) {
                console.error(`[debate-v2] ${agent} pass${pass} error:`, err);
                write(targetLocale === "en" ? "[Error generating response]" : "[Erreur lors de la génération]");
              }

              thread.push({ agent, content });
              write(`[[/TURN:${agent}]]`);

              if (!cancelled && content) {
                await supabase.from("messages").insert({
                  conversation_id: conversationId,
                  user_id: user.id,
                  role: "assistant",
                  agent_role: agent,
                  content,
                });
              }
            }
            if (cancelled) break;
          }

          write("[[/THREAD]]");

          if (cancelled) {
            controller.close();
            return;
          }

          // CEO makes the call
          write("[[CEO_CALL]]");

          const ceoPrompt = buildCeoCallPrompt({
            question: userMessage,
            project,
            thread,
            locale: targetLocale,
          });

          let ceoContent = "";
          try {
            const ceoResult = await streamAgent(ceoPrompt);
            for await (const chunk of ceoResult.stream) {
              if (cancelled) break;
              const text = chunk.text();
              if (text) { ceoContent += text; write(text); }
            }
          } catch (err) {
            console.error("[debate-v2] CEO call error:", err);
            write(targetLocale === "en" ? "[CEO call error — please retry]" : "[Erreur CEO — réessaie]");
          }

          write("[[/CEO_CALL]]");

          if (ceoContent) {
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              agent_role: "CEO",
              content: ceoContent,
            });
          }

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          write("[[END]]");
        } catch (err) {
          console.error("[debate-v2] fatal error:", err);
          const msg = err instanceof Error ? err.message : "Unknown error";
          write(`[[ERROR]]${msg}[[/ERROR]]`);
        } finally {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
      cancel() {
        cancelled = true;
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
    console.error("[debate-v2] route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
