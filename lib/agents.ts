export const AGENT_IDS = [
  "ceo", "cto", "cmo", "cpo", "cdo", "cfo", "dev", "cco",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export interface AgentConfig {
  id: AgentId;
  color: string;
}

export const AGENTS: AgentConfig[] = [
  { id: "ceo", color: "#8B5CF6" },
  { id: "cto", color: "#06B6D4" },
  { id: "cmo", color: "#F0ABFC" },
  { id: "cpo", color: "#A78BFA" },
  { id: "cdo", color: "#22D3EE" },
  { id: "cfo", color: "#FBBF24" },
  { id: "dev", color: "#10B981" },
  { id: "cco", color: "#F472B6" },
];
