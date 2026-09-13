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
 * Récupère ou crée LE fil d'un projet pour un rôle donné.
 *
 * La lecture passait par `maybeSingle()`, qui échoue dès qu'il existe deux
 * lignes — et rien n'empêchait d'en créer deux : il suffisait de deux rendus
 * simultanés de la page. À partir de là, chaque visite échouait en lecture,
 * créait un nouveau fil vide, et le fondateur retrouvait sa conversation
 * remise à zéro à chaque retour sur le projet.
 *
 * On lit donc le fil le plus récemment actif sans jamais exiger l'unicité.
 * L'index unique de la migration 0006 empêche le doublon à la source ; si deux
 * rendus se croisent malgré tout, le perdant relit le fil du gagnant au lieu
 * d'abandonner.
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

  const findThread = () =>
    supabase
      .from("conversations")
      .select("*")
      .eq("project_id", projectId)
      .eq("agent_role", agentRole)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  const { data: existing } = await findThread();
  if (existing) return existing as Conversation;

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
    // 23505 : l'index unique a refusé un doublon créé en parallèle.
    if (error.code === "23505") {
      const { data: winner } = await findThread();
      if (winner) return winner as Conversation;
    }
    console.error("getOrCreateConversation error:", error);
    return null;
  }

  return created as Conversation;
}

/**
 * Tous les messages d'un projet pour un rôle, tous fils confondus.
 *
 * Tant que la migration 0006 n'a pas fusionné les fils doublés, l'historique
 * d'un fondateur peut être éclaté entre plusieurs conversations. En lire une
 * seule n'en afficherait qu'un morceau ; on les lit toutes, dans l'ordre.
 */
export async function listThreadMessages(
  projectId: string,
  agentRole: AgentRole = "MENDLY"
): Promise<Message[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: threads } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", projectId)
    .eq("agent_role", agentRole)
    .eq("user_id", user.id);

  const ids = (threads ?? []).map((row) => (row as { id: string }).id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listThreadMessages error:", error);
    return [];
  }

  return (data ?? []) as Message[];
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