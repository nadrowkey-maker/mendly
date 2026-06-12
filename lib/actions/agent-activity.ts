"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns the timestamp of each agent's most recent message in a project,
 * keyed by agent role — for the "last intervention · 2h ago" sidebar (Bloc 1.4).
 */
export async function getLastAgentActivity(projectId: string): Promise<Record<string, string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data: convos } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", projectId);

  const ids = (convos ?? []).map((c) => (c as { id: string }).id);
  if (ids.length === 0) return {};

  const { data: msgs } = await supabase
    .from("messages")
    .select("agent_role, created_at")
    .in("conversation_id", ids)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(100);

  const result: Record<string, string> = {};
  for (const m of msgs ?? []) {
    const row = m as { agent_role: string | null; created_at: string };
    if (row.agent_role && !result[row.agent_role]) {
      result[row.agent_role] = row.created_at;
    }
  }
  return result;
}
