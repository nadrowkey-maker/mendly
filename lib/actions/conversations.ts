"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message, AgentRole } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";

/**
 * Récupère un projet par ID (vérifie que le user en est propriétaire grâce aux RLS)
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) return null;
  return data as Project;
}

/**
 * Récupère ou crée la conversation par défaut du CEO pour un projet.
 * Pour le MVP : 1 conversation par (projet, agent_role).
 */
export async function getOrCreateConversation(
  projectId: string,
  agentRole: AgentRole = "CEO"
): Promise<Conversation | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to find existing conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("project_id", projectId)
    .eq("agent_role", agentRole)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing as Conversation;

  // Create new conversation
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      project_id: projectId,
      user_id: user.id,
      agent_role: agentRole,
    })
    .select()
    .single();

  if (error) {
    console.error("getOrCreateConversation error:", error);
    return null;
  }

  return created as Conversation;
}

/**
 * Liste tous les messages d'une conversation, ordre chronologique.
 */
export async function listMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMessages error:", error);
    return [];
  }

  return (data ?? []) as Message[];
}

/**
 * Sauvegarde un message en DB (user ou assistant).
 */
export async function saveMessage(input: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  agentRole?: AgentRole;
}): Promise<Message | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      user_id: user.id,
      role: input.role,
      agent_role: input.agentRole ?? null,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    console.error("saveMessage error:", error);
    return null;
  }

  // Update conversation's updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  return data as Message;
}