import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { buildCtoSystemPrompt } from "@/lib/ai/agents/cto";
import { buildCmoSystemPrompt } from "@/lib/ai/agents/cmo";
import { buildCpoSystemPrompt } from "@/lib/ai/agents/cpo";
import { buildCfoSystemPrompt } from "@/lib/ai/agents/cfo";
import { buildCdoSystemPrompt } from "@/lib/ai/agents/cdo";
import { buildDevSystemPrompt } from "@/lib/ai/agents/dev";
import { buildCcoSystemPrompt } from "@/lib/ai/agents/cco";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";
import type { Message } from "@/lib/types/conversation";

export const runtime = "nodejs";
export const maxDuration = 60;

type PromptBuilder = (project: Project, locale: "fr" | "en") => string;

const PROMPT_BUILDERS: Record<DebateAgentRole, PromptBuilder> = {
  CTO: buildCtoSystemPrompt,
  CMO: buildCmoSystemPrompt,
  CPO: buildCpoSystemPrompt,
  CFO: buildCfoSystemPrompt,
  CDO: buildCdoSystemPrompt,
  DEV: buildDevSystemPrompt,
  CCO: buildCcoSystemPrompt,
};

export async function POST(req: NextRequest) {
  try {
    const {
      agentConversationId,
      ceoConversationId,
      projectId,
      invitedAgent,
      inviteReason,
      locale,
    } = (await req.json()) as {
      agentConversationId: string;
      ceoConversationId: string;
      projectId: string;
      invitedAgent: DebateAgentRole;
      inviteReason: string;
      locale?: string;
    };

    if (!agentConversationId || !ceoConversationId || !projectId || !invitedAgent) {
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

    // Fetch recent CEO conversation for context (last 10 messages)
    const { data: ceoMessages } = await supabase
      .from("messages")
      .select("role, content, agent_role")
      .eq("conversation_id", ceoConversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentContext = ((ceoMessages ?? []) as Pick<Message, "role" | "content" | "agent_role">[])
      .reverse()
      .map((m) => {
        const label = m.role === "user" ? "Founder" : (m.agent_role ?? "CEO");
        return `[${label}]: ${m.content}`;
      })
      .join("\n\n");

    // Build the invite prompt
    const agentSystemPrompt = PROMPT_BUILDERS[invitedAgent]?.(project, targetLocale) ?? "";

    const invitePrompt =
      targetLocale === "en"
        ? `${agentSystemPrompt}

---
SPECIAL CONTEXT — YOU'VE BEEN INVITED INTO A CONVERSATION

The CEO just brought you into this conversation. Reason: "${inviteReason}"

RECENT CONVERSATION BETWEEN THE FOUNDER AND CEO:
${recentContext || "(no context available)"}

Your job: Read the context above and add your expert perspective as ${invitedAgent}.
Be specific, actionable, and concise (150–200 words).
Build directly on what was discussed — don't repeat what's already been said.
End with 1–2 concrete next steps.`
        : `${agentSystemPrompt}

---
CONTEXTE SPÉCIAL — TU AS ÉTÉ INVITÉ DANS UNE CONVERSATION

Le CEO vient de t'amener dans cette conversation. Raison : "${inviteReason}"

CONVERSATION RÉCENTE ENTRE LE FONDATEUR ET LE CEO :
${recentContext || "(pas de contexte disponible)"}

Ton job : Lis le contexte ci-dessus et ajoute ta perspective d'expert en tant que ${invitedAgent}.
Sois précis, actionnable et concis (150–200 mots).
Construis directement sur ce qui a été discuté — ne répète pas ce qui a déjà été dit.
Termine par 1–2 next steps concrets.
Tutoie le fondateur.`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          const result = await geminiFlash.generateContentStream(invitePrompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save to invited agent's conversation
          if (fullContent) {
            await supabase.from("messages").insert({
              conversation_id: agentConversationId,
              user_id: user.id,
              role: "assistant",
              agent_role: invitedAgent,
              content: fullContent,
            });

            await supabase
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", agentConversationId);
          }
        } catch (err) {
          console.error("[invite] error:", err);
          const fallback =
            targetLocale === "en"
              ? "[Error generating response. Please try again.]"
              : "[Erreur lors de la génération. Réessaie.]";
          controller.enqueue(encoder.encode(fallback));
        } finally {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[invite] route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
