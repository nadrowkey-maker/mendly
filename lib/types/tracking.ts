// Types for the roadmap data layer: tracked actions, whispers,
// memory events, and debate records.

export type ActionStatus = "todo" | "done" | "abandoned";
export type ActionSource = "manual" | "debate" | "ceo";

export interface ActionItem {
  id: string;
  project_id: string;
  user_id: string;
  conversation_id: string | null;
  content: string;
  status: ActionStatus;
  source: ActionSource;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Whisper {
  id: string;
  project_id: string;
  user_id: string;
  agent_role: string;
  content: string;
  read: boolean;
  created_at: string;
}

export type MemoryKind = "decision" | "assumption" | "risk" | "milestone";

export interface MemoryEvent {
  id: string;
  project_id: string;
  user_id: string;
  kind: MemoryKind;
  title: string;
  detail: string | null;
  created_at: string;
}

export interface DebateRecord {
  id: string;
  project_id: string;
  user_id: string;
  conversation_id: string | null;
  question: string;
  verdict: string | null;
  agents: string[];
  created_at: string;
}

/** Result of checking whether the user can launch a debate right now. */
export interface DebateAccess {
  canLaunch: boolean;
  /** "weekly" (free, sliding 7-day) or "unlimited" (paid). */
  cadence: "weekly" | "unlimited";
  /** When the next debate unlocks (free plan only), else null. */
  nextAvailableAt: string | null;
  lastDebateAt: string | null;
}
