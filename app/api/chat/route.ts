import { NextRequest, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCeoSystemPrompt } from "@/lib/ai/agents/ceo";
import { buildCtoSystemPrompt } from "@/lib/ai/agents/cto";
import { buildCmoSystemPrompt } from "@/lib/ai/agents/cmo";
import { buildCpoSystemPrompt } from "@/lib/ai/agents/cpo";
import { buildCfoSystemPrompt } from "@/lib/ai/agents/cfo";
import { buildCdoSystemPrompt } from "@/lib/ai/agents/cdo";
import { buildDevSystemPrompt } from "@/lib/ai/agents/dev";
import { buildCcoSystemPrompt } from "@/lib/ai/agents/cco";
import { buildMendlySystemPrompt } from "@/lib/ai/agents/mendly";
import { streamGeminiResponse, toGeminiHistory } from "@/lib/ai/gemini";
import type { FileAttachment } from "@/lib/ai/gemini";
import { withFounderContext } from "@/lib/ai/with-founder-context";
import { buildProjectMemoryBlock } from "@/lib/ai/project-memory";
import { shouldHarvest, harvestConversationDecision } from "@/lib/ai/harvest-conversation";
import type { MemoryEvent } from "@/lib/types/tracking";
import { withAgentCore } from "@/lib/ai/prompts/core-principles";
import { viabilityVerdictModule, overwhelmedModule } from "@/lib/ai/prompts/special-modes";
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
    case "MENDLY":
      return buildMendlySystemPrompt(project, locale);
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
      mode,
    }: {
      conversationId: string;
      projectId: string;
      userMessage: string;
      locale?: string;
      agentRole?: string;
      attachments?: FileAttachment[];
      mode?: "viability" | "overwhelmed";
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
    const [projectRes, historyRes, profileRes, actionsRes, memoryRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("messages")
        .select("role, content, agent_role")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("actions")
        .select("content, created_at")
        .eq("project_id", projectId)
        .eq("status", "todo")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("memory_events")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(40),
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
    const withFounder = withFounderContext(baseSystemPrompt, profile, targetLocale);
    // MENDLY carries its own operating principles and never hands off to a
    // colleague — the shared multi-agent core (with its <invite> mechanic)
    // would contradict its single-entity identity.
    let systemPrompt =
      agentRole === "MENDLY" ? withFounder : withAgentCore(withFounder, targetLocale);
    const vision = (project as Project).vision;
    if (vision) {
      systemPrompt +=
        targetLocale === "fr"
          ? `\n\n# Pourquoi ce fondateur se lance\n${vision}\n\nGarde cette motivation profonde en tête : rappelle-la dans les coups de doute, et célèbre les jalons qui s'en rapprochent.`
          : `\n\n# Why this founder is building this\n${vision}\n\nKeep this deeper motivation in mind: bring it back in moments of doubt, and celebrate milestones that move toward it.`;
    }
    // Bloc 3.2 — "le retour" : ramener les actions non terminées dans le contexte,
    // sans jamais culpabiliser. La conversation repart de là, pas de zéro.
    const openActions = (actionsRes.data ?? []) as { content: string; created_at: string }[];
    if (openActions.length > 0) {
      const list = openActions.map((a) => `- ${a.content}`).join("\n");
      systemPrompt +=
        targetLocale === "fr"
          ? `\n\n# Actions en cours (décidées lors de sessions précédentes)\nLe fondateur a ces actions non terminées :\n${list}\n\nSi c'est pertinent pour la conversation, reviens dessus naturellement ("la dernière fois on avait décidé X — où tu en es ?"). JAMAIS de reproche : cherche la cause (pas le temps ? trop ambitieux ? bloqué ?) et propose une version plus réaliste. On repart de là, pas de zéro.`
          : `\n\n# Open actions (decided in previous sessions)\nThe founder has these unfinished actions:\n${list}\n\nWhen relevant to the conversation, revisit them naturally ("last time we decided X — where are you with it?"). NEVER blame: find the cause (no time? too ambitious? blocked?) and offer a more realistic version. Pick up from there, not from zero.`;
    }

    // Point 3 — la mémoire réelle du projet. Les actions ouvertes ci-dessus
    // disent ce qui reste à faire ; ceci dit ce qui a déjà été tranché, craint
    // et accompli. Injecté pour tous les rôles, pas seulement MENDLY : la
    // mémoire appartient au projet, pas à la persona qui parle.
    systemPrompt += buildProjectMemoryBlock(
      (memoryRes.data ?? []) as MemoryEvent[],
      targetLocale
    );

    if (mode === "viability") systemPrompt += viabilityVerdictModule(targetLocale);
    else if (mode === "overwhelmed") systemPrompt += overwhelmedModule(targetLocale);
    const cleanedHistory = (history ?? []).map((m) => {
      const row = m as { role: string; content: string; agent_role?: string | null };
      if (row.agent_role === "DEBATE") {
        try {
          const d = JSON.parse(row.content) as { ceoCall?: string };
          return { role: row.role, content: `[Team debate — CEO decision] ${d.ceoCall ?? ""}` };
        } catch {
          return { role: row.role, content: "" };
        }
      }
      return { role: row.role, content: row.content };
    });
    const geminiHistory = toGeminiHistory(
      cleanedHistory as Pick<Message, "role" | "content">[]
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

          // Point 4a — les décisions prises en conversation simple, hors débat,
          // ne laissaient aucune trace. after() exécute l'extraction une fois la
          // réponse envoyée : le fondateur ne l'attend jamais.
          const assistantReplies =
            ((history ?? []) as { role: string }[]).filter((m) => m.role === "assistant")
              .length + 1;
          if (shouldHarvest(assistantReplies)) {
            const transcript = [
              ...((history ?? []) as { role: string; content: string }[]),
              { role: "user", content: userMessage },
              { role: "assistant", content: fullResponse },
            ];
            after(() =>
              harvestConversationDecision({
                projectId,
                userId: user.id,
                transcript,
                locale: targetLocale,
              })
            );
          }

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