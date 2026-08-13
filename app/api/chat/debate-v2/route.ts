import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { PLANS } from "@/lib/stripe/plans";
import { selectAgents } from "@/lib/ai/debate/selector";
import { getDebateAccess } from "@/lib/actions/debates";
import { track } from "@/lib/actions/analytics";
import { buildThreadTurnPrompt } from "@/lib/ai/debate/orchestrator";
import { buildCeoCallPrompt } from "@/lib/ai/debate/synthesizer";
import { generateWhisper } from "@/lib/ai/debate/whisper";
import { generateConsensusVote } from "@/lib/ai/debate/consensus";
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

  const prompt =
    locale === "en"
      ? `Debate on "${question}":
${threadStr}

ALREADY IN THE DEBATE (do NOT suggest these): ${existingAgents.join(", ")}
CAN join: ${available.join(", ")}

Is a CRITICAL perspective completely missing that would change the outcome?
Reply with EXACTLY one word from this list: ${available.join(", ")} — or reply NONE.`
      : `Débat sur "${question}" :
${threadStr}

DÉJÀ DANS LE DÉBAT (ne pas suggérer) : ${existingAgents.join(", ")}
PEUVENT rejoindre : ${available.join(", ")}

Une perspective CRITIQUE est-elle complètement absente et changerait la décision ?
Réponds avec EXACTEMENT un mot parmi : ${available.join(", ")} — ou réponds NONE.`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const raw = result.response.text().trim().toUpperCase();
    for (const agent of available) {
      if (new RegExp(`\\b${agent}\\b`).test(raw)) return agent;
    }
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
    const { conversationId, projectId, userMessage, locale, boardroom } =
      (await req.json()) as {
        conversationId: string;
        projectId: string;
        userMessage: string;
        locale?: string;
        boardroom?: boolean;
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

    // Sliding-recharge gate: free gets one team debate per 7-day window.
    const access = await getDebateAccess();
    if (!access.canLaunch) {
      return new Response(
        JSON.stringify({ error: "debate_recharge", nextAvailableAt: access.nextAvailableAt }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    // Bloc 6.3.5 — "boardroom" mode: a deeper debate for critical decisions, Pro only.
    const isBoardroom = boardroom === true && rateLimit.plan === "pro";
    void track("debate_launched", { plan: rateLimit.plan });

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

          // Select agents — scoped to this project's persistent team (assigned
          // once by Mendly at creation, see lib/ai/team/assign-team.ts) when one
          // exists, so debates draw from the project's own room, not the full
          // plan-wide roster. Falls back to the plan pool if the intersection
          // is too thin (e.g. the plan was downgraded after the team was set).
          const planAllowed = (PLANS[rateLimit.plan].agentsAvailable as readonly string[]).filter(
            (a) => a !== "CEO"
          ) as DebateAgentRole[];
          const teamAllowed = project.assigned_agents?.length
            ? planAllowed.filter((a) => project.assigned_agents!.includes(a))
            : planAllowed;
          const allowed = teamAllowed.length >= 2 ? teamAllowed : planAllowed;

          const selection = await selectAgents({
            question: userMessage,
            project,
            locale: targetLocale,
            allowed,
          });

          write(`[[META]]${JSON.stringify(selection)}[[/META]]`);

          const thread: { agent: DebateAgentRole; content: string }[] = [];
          const numPasses = (selection.agents.length <= 2 ? 3 : 2) + (isBoardroom ? 1 : 0);
          let activeAgents = [...selection.agents];
          let whisperCount = 0;

          write("[[THREAD]]");

          for (let pass = 1; pass <= numPasses; pass++) {
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

              // Whisper: pass 1 only, 60% chance, max 2 per debate
              if (pass === 1 && !cancelled && content && whisperCount < 2 && Math.random() < 0.60) {
                try {
                  const whisperText = await generateWhisper({
                    agent,
                    question: userMessage,
                    agentTurnContent: content,
                    previousTurns: [...thread],
                    project,
                    locale: targetLocale,
                  });
                  if (whisperText) {
                    write(`[[WHISPER:${agent}]]${whisperText}[[/WHISPER:${agent}]]`);
                    whisperCount++;
                  }
                } catch {
                  // non-fatal
                }
              }

              // Turns are persisted together as a single debate message at the end,
              // so the debate re-renders as a debate (not flat bubbles) on reload.
            }

            // After pass 1: detect surprise expert
            if (pass === 1 && !cancelled && numPasses > 1) {
              const surprise = await detectSurpriseExpert(
                thread, activeAgents, userMessage, project, targetLocale
              );
              if (surprise && !activeAgents.includes(surprise)) {
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
          const finalCeoPrompt = isBoardroom
            ? ceoPrompt +
              (targetLocale === "fr"
                ? "\n\n# MODE BOARDROOM (décision critique)\nRigueur maximale : chiffre les enjeux, nomme explicitement le pire scénario et le plan B, pèse le coût de l'inaction, et tranche sans ambiguïté."
                : "\n\n# BOARDROOM MODE (critical decision)\nMaximum rigor: quantify the stakes, explicitly name the worst case and the plan B, weigh the cost of inaction, and make an unambiguous call.")
            : ceoPrompt;

          let ceoContent = "";
          try {
            const ceoResult = await streamAgent(finalCeoPrompt);
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

          // (verdict is persisted inside the consolidated debate message below)

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          // Consensus votes (parallel generation, sequential reveal)
          if (!cancelled && ceoContent) {
            write("[[CONSENSUS_START]]");

            const voteResults = await Promise.all(
              activeAgents.map((agent) =>
                generateConsensusVote({
                  agent,
                  question: userMessage,
                  ceoCall: ceoContent,
                  thread,
                  project,
                  locale: targetLocale,
                })
              )
            );

            for (const [i, vote] of voteResults.entries()) {
              if (cancelled) break;
              const agent = activeAgents[i];
              write(`[[VOTE:${agent}:${vote.verdict}]]${vote.note}[[/VOTE:${agent}]]`);
              if (!cancelled) await new Promise((r) => setTimeout(r, 380));
            }

            write("[[CONSENSUS_END]]");

            // Persist the entire debate as ONE structured message → re-renders
            // as the full DebateView (not flat bubbles) when the page reloads.
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              agent_role: "DEBATE",
              content: JSON.stringify({
                question: userMessage,
                selection,
                thread,
                ceoCall: ceoContent,
                consensus: voteResults.map((v, i) => ({
                  agent: activeAgents[i],
                  verdict: v.verdict,
                  note: v.note,
                })),
              }),
            });
          }

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
