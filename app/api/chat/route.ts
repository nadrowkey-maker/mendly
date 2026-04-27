import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCeoSystemPrompt } from "@/lib/ai/agents/ceo";
import { streamGeminiResponse, toGeminiHistory } from "@/lib/ai/gemini";
import type { Project } from "@/lib/types/project";
import type { Message } from "@/lib/types/conversation";

export const runtime = "nodejs"; // Gemini SDK needs Node, not Edge

export async function POST(req: NextRequest) {
  try {
    const { conversationId, projectId, userMessage, locale } = await req.json();

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

    // Fetch project (RLS ensures user owns it)
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

    // Fetch conversation history (excluding the user message we're about to add)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    // Save the user message FIRST (so it persists even if streaming fails)
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    // Build system prompt with project context
    const systemPrompt = buildCeoSystemPrompt(
      project as Project,
      locale === "en" ? "en" : "fr"
    );

    // Convert history for Gemini
    const geminiHistory = toGeminiHistory(
      (history ?? []) as Pick<Message, "role" | "content">[]
    );

    // Stream the Gemini response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGeminiResponse(
            systemPrompt,
            geminiHistory,
            userMessage
          )) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Save the complete assistant response in DB
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            agent_role: "CEO",
            content: fullResponse,
          });

          // Update conversation's updated_at
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