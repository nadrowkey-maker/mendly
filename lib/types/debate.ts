import type { AgentRole } from "./conversation";

export type DebateAgentRole = Exclude<AgentRole, "CEO">;

export interface AgentSelection {
  agents: DebateAgentRole[];
  rationale: string;
}

export interface DebateMessage {
  id: string;
  agent: AgentRole;
  round: 1 | 2;
  content: string;
  isStreaming: boolean;
}

export type DebateState =
  | { phase: "idle" }
  | { phase: "selecting"; question: string }
  | {
      phase: "round1" | "round2";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
    }
  | {
      phase: "synthesizing";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      synthesis: string;
    }
  | {
      phase: "done";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      synthesis: string;
    }
  | {
      phase: "aborted";
      question: string;
      messages: DebateMessage[];
      synthesis: string | null;
    }
  | { phase: "error"; message: string };

export interface DebateV2Request {
  conversationId: string;
  projectId: string;
  userMessage: string;
  locale?: string;
}

export interface InviteRequest {
  agentConversationId: string;
  ceoConversationId: string;
  projectId: string;
  invitedAgent: DebateAgentRole;
  inviteReason: string;
  locale?: string;
}
