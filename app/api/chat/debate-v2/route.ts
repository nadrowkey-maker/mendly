import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { PLANS } from "@/lib/stripe/plans";
import { selectAgents } from "@/lib/ai/debate/selector";
import { buildRound1Prompt, buildRound2Prompt } from "@/lib/ai/debate/orchestrator";
import { buildSynthesisPrompt } from "@/lib/ai/debate/synthesizer";
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

          const round1Map = new Map<DebateAgentRole, string>();
          const round2Map = new Map<DebateAgentRole, string>();

          // ─── Round 1 ────────────────────────────────────────────
          write("[[ROUND:1]]");

          for (const agent of selection.agents) {
            if (cancelled) break;

            write(`[[AGENT:${agent}:1]]`);

            const prompt = buildRound1Prompt({
              agent,
              question: userMessage,
              otherAgents: selection.agents,
              project,
              locale: targetLocale,
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
              console.error(`[debate-v2] ${agent} round1 error:`, err);
              write(targetLocale === "en" ? "[Error generating response]" : "[Erreur lors de la génération]");
            }

            round1Map.set(agent, content);
            write(`[[/AGENT:${agent}:1]]`);

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

          write("[[/ROUND:1]]");

          if (cancelled) {
            controller.close();
            return;
          }

          // ─── Round 2 ────────────────────────────────────────────
          write("[[ROUND:2]]");

          const round1Content = selection.agents.map((a) => ({
            agent: a,
            content: round1Map.get(a) ?? "",
          }));

          for (const agent of selection.agents) {
            if (cancelled) break;

            write(`[[AGENT:${agent}:2]]`);

            const prompt = buildRound2Prompt({
              agent,
              question: userMessage,
              round1Content,
              project,
              locale: targetLocale,
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
              console.error(`[debate-v2] ${agent} round2 error:`, err);
              write(targetLocale === "en" ? "[Error generating response]" : "[Erreur lors de la génération]");
            }

            round2Map.set(agent, content);
            write(`[[/AGENT:${agent}:2]]`);

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

          write("[[/ROUND:2]]");

          if (cancelled) {
            controller.close();
            return;
          }

          // ─── CEO Synthesis ───────────────────────────────────────
          write("[[SYNTHESIS]]");

          const transcript = [
            ...selection.agents.map((a) => ({ agent: a, round: 1 as const, content: round1Map.get(a) ?? "" })),
            ...selection.agents.map((a) => ({ agent: a, round: 2 as const, content: round2Map.get(a) ?? "" })),
          ];

          const synthPrompt = buildSynthesisPrompt({
            question: userMessage,
            project,
            transcript,
            locale: targetLocale,
          });

          let synthContent = "";
          try {
            const synthResult = await streamAgent(synthPrompt);
            for await (const chunk of synthResult.stream) {
              if (cancelled) break;
              const text = chunk.text();
              if (text) { synthContent += text; write(text); }
            }
          } catch (err) {
            console.error("[debate-v2] synthesis error:", err);
            write(targetLocale === "en" ? "[Synthesis error — please retry]" : "[Erreur de synthèse — réessaie]");
          }

          write("[[/SYNTHESIS]]");

          if (synthContent) {
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              agent_role: "CEO",
              content: synthContent,
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
