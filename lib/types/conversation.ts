 export type AgentRole = "CEO" | "CTO" | "CMO" | "CPO" | "CFO" | "CDO" | "DEV" | "CCO";
export type MessageRole = "user" | "assistant" | "system";

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  agent_role: AgentRole;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  agent_role: AgentRole | null;
  content: string;
  created_at: string;
}