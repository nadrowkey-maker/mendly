import { geminiFlash } from "@/lib/ai/gemini";
import { selectAgents } from "@/lib/ai/debate/selector";
import { buildThreadTurnPrompt } from "@/lib/ai/debate/orchestrator";
import { buildCeoCallPrompt } from "@/lib/ai/debate/synthesizer";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

/**
 * Runs a full debate without an HTTP request behind it.
 *
 * The debate-v2 route can't be reused here: it is built around a streaming
 * response and a founder watching it happen. A cron has no one watching, so it
 * needs the same pipeline with the theatre removed.
 *
 * Deliberately dropped, compared to the live debate:
 * - streaming, obviously;
 * - whispers, which exist to make the waiting enjoyable — there is no waiting;
 * - consensus votes, which are a reveal animation more than a payload.
 * What survives is what carries meaning: agent selection, the argued thread,
 * and the final call.
 *
 * Fewer passes than live (2 instead of 2-3) on purpose: nobody is watching it
 * unfold, so length buys nothing, while every extra pass is a model call
 * multiplied by every project on every run.
 */

const PASSES = 2;

export interface HeadlessDebateResult {
  agents: DebateAgentRole[];
  rationale: string;
  thread: { agent: DebateAgentRole; content: string }[];
  verdict: string;
}

async function generate(prompt: string): Promise<string> {
  const res = await geminiFlash.generateContent(prompt);
  return res.response.text().trim();
}

export async function runHeadlessDebate(input: {
  question: string;
  project: Project;
  allowed: DebateAgentRole[];
  locale: "fr" | "en";
}): Promise<HeadlessDebateResult | null> {
  try {
    const selection = await selectAgents({
      question: input.question,
      project: input.project,
      locale: input.locale,
      allowed: input.allowed,
    });

    if (!selection.agents.length) return null;

    const thread: { agent: DebateAgentRole; content: string }[] = [];

    for (let pass = 1; pass <= PASSES; pass++) {
      for (const agent of selection.agents) {
        const prompt = buildThreadTurnPrompt({
          agent,
          question: input.question,
          previousTurns: [...thread],
          project: input.project,
          locale: input.locale,
          pass,
          totalPasses: PASSES,
        });
        try {
          const content = await generate(prompt);
          if (content) thread.push({ agent, content });
        } catch (err) {
          // One silent agent doesn't invalidate the session — the others still
          // argued. An empty thread is caught below.
          console.warn(`[headless-debate] ${agent} pass${pass} failed:`, err);
        }
      }
    }

    if (thread.length < 2) return null;

    const verdict = await generate(
      buildCeoCallPrompt({
        question: input.question,
        project: input.project,
        thread,
        locale: input.locale,
      })
    );

    if (!verdict) return null;

    return {
      agents: selection.agents,
      rationale: selection.rationale,
      thread,
      verdict,
    };
  } catch (err) {
    console.error("[headless-debate] failed:", err);
    return null;
  }
}
