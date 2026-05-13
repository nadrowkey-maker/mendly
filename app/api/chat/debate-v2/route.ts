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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALL_DEBATE_AGENTS: DebateAgentRole[] = ["CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"];

async function detectSurpriseExpert(
  thread: { agent: DebateAgentRole; content: string }[],
  existingAgents: DebateAgentRole[],
  question: string,
  project: Project,
  locale: "fr" | "en"
): Promise<DebateAgentRole | null> {
  const available = ALL_DEBATE_AGENTS.filter((a) => !existingAgents.includes(a));
  if (available.length === 0) return null;

  const threadStr = thread.map((t) => `${t.agent}: ${t.content.slice(0, 120)}`).join("\n");

  const prompt = locale === "en"
    ? `Debate on "${question}" for project "${project.name}":
${threadStr}

Current debaters: ${existingAgents.join(", ")}
Available specialists: ${available.join(", ")}

Is there a CRITICAL expert perspective completely absent from this debate that would significantly change the decision?
Answer with ONLY the agent role (e.g. "CFO") or "NONE". One word only. No explanation.`
    : `Débat sur "${question}" pour le projet "${project.name}" :
${threadStr}

Participants actuels : ${existingAgents.join(", ")}
Spécialistes disponibles : ${available.join(", ")}

Y a-t-il une perspective d'expert CRITIQUE complètement absente de ce débat qui changerait significativement la décision ?
Réponds avec UNIQUEMENT le rôle (ex : "CFO") ou "NONE". Un seul mot, aucune explication.`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase().replace(/[^A-Z]/g, "") as DebateAgentRole;
    if (available.includes(text)) return text;
    return null;
  } catch {
    return null;
  }
}

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
          // Mutable agents list — surprise expert may be added after pass 1
          let activeAgents = [...selection.agents];

          write("[[THREAD]]");

          for (let pass = 1; pass <= numPasses; pass++) {
            // Randomize speaking order each pass
            const passOrder = shuffleArray(activeAgents);

            for (const agent of passOrder) {
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

            // After pass 1: detect if a critical expert perspective is missing
            if (pass === 1 && !cancelled && numPasses > 1) {
              const surprise = await detectSurpriseExpert(
                thread, activeAgents, userMessage, project, targetLocale
              );
              if (surprise) {
                activeAgents = [...activeAgents, surprise];
                write(`[[SURPRISE_JOIN:${surprise}]]`);
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
