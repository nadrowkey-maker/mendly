import type { AgentRole } from "./conversation";

// MENDLY is a single-entity chat role, not a debate specialist — it never
// enters the multi-agent debate pool.
export type DebateAgentRole = Exclude<AgentRole, "CEO" | "MENDLY">;

export type VoteVerdict = "agree" | "reluctant" | "disagree";

export interface ConsensusVote {
  agent: DebateAgentRole;
  verdict: VoteVerdict;
  note: string;
}

export interface TensionLink {
  a: DebateAgentRole;
  b: DebateAgentRole;
  intensity: 1 | 2 | 3;
}

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
  whisper?: string;
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
      phase: "revealing";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      ceoCall: string;
      consensus: ConsensusVote[];
      tensionMap: TensionLink[] | null;
    }
  | {
      phase: "done";
      question: string;
      selection: AgentSelection;
      messages: DebateMessage[];
      ceoCall: string;
      consensus: ConsensusVote[];
      tensionMap: TensionLink[] | null;
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
