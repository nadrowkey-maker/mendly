import type { AgentRole } from "./conversation";

export type DebateAgentRole = Exclude<AgentRole, "CEO">;

export interface AgentSelection {
  agents: DebateAgentRole[];
  rationale: string;
  lateJoins?: DebateAgentRole[];
}

export interface DebateMessage {
  id: string;
  agent: AgentRole;
  turnIndex: number;
  content: string;
  isStreaming: boolean;
  isLateJoin?: boolean;
}

export type DebateState =
  | { phase: "idle" }
  | { phase: "selecting"; question: string }
  | {
      phase: "threading";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
    }
  | {
      phase: "deciding";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      ceoCall: string;
    }
  | {
      phase: "done";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      ceoCall: string;
    }
  | {
      phase: "aborted";
      question: string;
      messages: DebateMessage[];
      ceoCall: string | null;
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
