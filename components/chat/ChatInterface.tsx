"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShieldQuestion, LifeBuoy, Users, MessageSquare, Brain, FileStack, FolderClosed } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { DebateView } from "./DebateView";
import { TeamRoomHeader, TeamRoomEmptyState } from "./TeamRoomView";
import { AutonomousSessions } from "./AutonomousSessions";
import { SpeakingBar } from "@/components/app/SpeakingBar";
import { MendlyOrb } from "@/components/ui/MendlyOrb";
import { GenerateMemoButton } from "./GenerateMemoButton";
import { TeamIntroSequence } from "@/components/dashboard/TeamIntroSequence";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import type { NavGroup } from "@/components/app/nav-types";
import { ProjectConsoleStrip } from "@/components/chat/ProjectConsoleStrip";
import { parseReply } from "@/lib/ai/room-suggestion";
import type { ProjectStats } from "@/lib/actions/project-stats";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import { harvestVerdict } from "@/lib/actions/harvest";
import type { Message, AgentRole } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";
import type { FileAttachment } from "@/lib/ai/gemini";
import type { DebateState, DebateAgentRole, AgentSelection, ConsensusVote, VoteVerdict } from "@/lib/types/debate";

interface ChatInterfaceProps {
  project: Project;
  conversationId: string;
  initialMessages: Message[];
  locale: string;
  initialUsageUsed: number;
  initialUsageLimit: number;
  userPlan: string;
  userEmail: string | null;
  allProjects: Project[];
  projectStats: ProjectStats;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentRole?: string | null;
  isStreaming?: boolean;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  /** Question que Mendly propose d'emmener en salle de réunion. */
  roomSuggestion?: string | null;
}

interface AgentState {
  conversationId: string;
  messages: DisplayMessage[];
  loaded: boolean;
}

const AGENT_LABELS: Record<AgentRole, string> = {
  CEO: "CEO",
  CTO: "CTO",
  CMO: "CMO",
  CPO: "CPO",
  CFO: "CFO",
  CDO: "CDO",
  DEV: "DEV",
  CCO: "CCO",
  MENDLY: "MENDLY",
};


function toDisplayMessages(messages: Message[]): DisplayMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    agentRole: m.agent_role,
  }));
}

/** Rebuild a finished DebateState from a stored "DEBATE" message so it
 *  re-renders as the full debate view (not flat bubbles) after reload. */
function reconstructDebate(content: string): DebateState | null {
  try {
    const d = JSON.parse(content) as {
      question?: string;
      selection?: AgentSelection;
      thread?: { agent: DebateAgentRole; content: string }[];
      ceoCall?: string;
      consensus?: ConsensusVote[];
    };
    if (!d || !Array.isArray(d.thread)) return null;
    return {
      phase: "done",
      question: d.question ?? "",
      selection: d.selection ?? { agents: [], rationale: "" },
      messages: d.thread.map((t, i) => ({
        id: `dr-${i}`,
        agent: t.agent,
        turnIndex: i,
        content: t.content,
        isStreaming: false,
      })),
      ceoCall: d.ceoCall ?? "",
      consensus: Array.isArray(d.consensus) ? d.consensus : [],
      tensionMap: null,
    };
  } catch {
    return null;
  }
}

export function ChatInterface({
  project,
  conversationId,
  initialMessages,
  locale,
  initialUsageUsed,
  initialUsageLimit,
  userPlan,
  userEmail,
  allProjects,
  projectStats,
}: ChatInterfaceProps) {
  const t = useTranslations("chat");
  const tSide = useTranslations("sidebar");

  const [showIntro, setShowIntro] = useState(true);
  const [activeAgent, setActiveAgent] = useState<AgentRole>("MENDLY");
  const [switchingAgent, setSwitchingAgent] = useState(false);
  const [teamRoomActive, setTeamRoomActive] = useState(false);
  const [agentData, setAgentData] = useState<Partial<Record<AgentRole, AgentState>>>({
    CEO: {
      conversationId,
      messages: toDisplayMessages(initialMessages),
      loaded: true,
    },
  });

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [debateState, setDebateState] = useState<DebateState>({ phase: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [usageUsed, setUsageUsed] = useState(initialUsageUsed);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debateAbortRef = useRef<AbortController | null>(null);

  const activeData = agentData[activeAgent];
  const activeMessages = activeData?.messages ?? [];
  const activeConversationId = activeData?.conversationId ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeAgent, debateState]);

  // Auto-harvest: when a debate ends, persist the decision + 3 actions (Bloc 2 / 3.2).
  const harvestedRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      debateState.phase === "done" &&
      "ceoCall" in debateState &&
      debateState.ceoCall &&
      harvestedRef.current !== debateState.ceoCall
    ) {
      harvestedRef.current = debateState.ceoCall;
      const agents = "selection" in debateState ? debateState.selection.agents : [];
      void harvestVerdict({
        projectId: project.id,
        conversationId: activeConversationId || null,
        question: debateState.question,
        verdict: debateState.ceoCall,
        agents,
      }).catch(() => {});
    }
  }, [debateState, project.id, activeConversationId]);

  const busy = isLoading || isDebating || switchingAgent;

  // The team room reuses the CEO conversation — debates already live there
  // (agent_role: "DEBATE" messages) regardless of which agent tab triggered
  // them. Forcing activeAgent back to CEO keeps activeConversationId (and so
  // handleDebate's target) pointed at the thread the room actually reads from.
  /**
   * Ouvre la salle de réunion, éventuellement avec une question pré-remplie.
   *
   * Suivre un conseil de Mendly ne doit coûter qu'un clic : sans la question
   * reprise automatiquement, le fondateur devrait la retaper de mémoire, et
   * c'est exactement là qu'on perd les gens.
   */
  const handleTeamRoomOpen = (question?: string) => {
    if (busy) return;
    if (question) setInput(question);
    setActiveAgent("CEO");
    setTeamRoomActive(true);
    setError(null);
    setDebateState({ phase: "idle" });
  };

  const handleAgentSwitch = async (agent: AgentRole) => {
    if ((agent === activeAgent && !teamRoomActive) || busy) return;
    setActiveAgent(agent);
    setTeamRoomActive(false);
    setError(null);
    setDebateState({ phase: "idle" });

    if (agentData[agent]) return;

    setSwitchingAgent(true);
    try {
      const convo = await getOrCreateConversation(project.id, agent);
      if (!convo) throw new Error("Failed");
      const msgs = await listMessages(convo.id);
      setAgentData((prev) => ({
        ...prev,
        [agent]: {
          conversationId: convo.id,
          messages: toDisplayMessages(msgs),
          loaded: true,
        },
      }));
    } catch (err) {
      console.error("Agent switch error:", err);
      setError(t("errorGeneric"));
      setActiveAgent("CEO");
    } finally {
      setSwitchingAgent(false);
    }
  };

  const handleSubmit = async (override?: string, mode?: "viability" | "overwhelmed") => {
    const trimmed = (typeof override === "string" ? override : input).trim();
    if (!trimmed || busy || !activeConversationId) return;

    setError(null);
    setInput("");
    const fileToSend = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    setAgentData((prev) => ({
      ...prev,
      [activeAgent]: {
        ...prev[activeAgent]!,
        messages: [
          ...(prev[activeAgent]?.messages ?? []),
          {
            id: userMsgId,
            role: "user",
            content: trimmed,
            attachmentName: fileToSend?.name ?? null,
            attachmentMime: fileToSend?.mimeType ?? null,
          },
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            agentRole: activeAgent,
            isStreaming: true,
          },
        ],
      },
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          projectId: project.id,
          userMessage: trimmed,
          locale,
          agentRole: activeAgent,
          attachments: fileToSend ? [fileToSend] : undefined,
          mode,
        }),
      });

      if (response.status === 429) {
        setError(t("errorRateLimited"));
        setAgentData((prev) => ({
          ...prev,
          [activeAgent]: {
            ...prev[activeAgent]!,
            messages: prev[activeAgent]!.messages.filter(
              (m) => m.id !== assistantMsgId && m.id !== userMsgId
            ),
          },
        }));
        return;
      }
      if (response.status === 403) {
        setError(t("errorPlanRequired"));
        setAgentData((prev) => ({
          ...prev,
          [activeAgent]: {
            ...prev[activeAgent]!,
            messages: prev[activeAgent]!.messages.filter(
              (m) => m.id !== assistantMsgId && m.id !== userMsgId
            ),
          },
        }));
        return;
      }
      if (!response.ok || !response.body) throw new Error("Failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Le marqueur de salle est retiré à chaque image du flux : laissé tel
        // quel, il clignoterait en syntaxe brute avant d'être interprété.
        const streamed = parseReply(accumulated);
        setAgentData((prev) => ({
          ...prev,
          [activeAgent]: {
            ...prev[activeAgent]!,
            messages: prev[activeAgent]!.messages.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: streamed.body, roomSuggestion: streamed.suggestion }
                : m
            ),
          },
        }));
      }

      const final = parseReply(accumulated);
      setAgentData((prev) => ({
        ...prev,
        [activeAgent]: {
          ...prev[activeAgent]!,
          messages: prev[activeAgent]!.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: final.body, roomSuggestion: final.suggestion, isStreaming: false }
              : m
          ),
        },
      }));
      setUsageUsed((u) => u + 1);
    } catch (err) {
      console.error("Chat error:", err);
      setError(t("errorGeneric"));
      setAgentData((prev) => ({
        ...prev,
        [activeAgent]: {
          ...prev[activeAgent]!,
          messages: prev[activeAgent]!.messages.filter((m) => m.id !== assistantMsgId),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebate = async () => {
    const trimmed = input.trim();
    if (!trimmed || busy || !activeConversationId) return;

    setError(null);
    setInput("");
    setIsDebating(true);
    setDebateState({ phase: "selecting", question: trimmed });

    const userMsgId = `user-${Date.now()}`;
    setAgentData((prev) => ({
      ...prev,
      CEO: {
        ...prev.CEO!,
        messages: [
          ...(prev.CEO?.messages ?? []),
          { id: userMsgId, role: "user", content: trimmed },
        ],
      },
    }));

    const ac = new AbortController();
    debateAbortRef.current = ac;

    try {
      const response = await fetch("/api/chat/debate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          projectId: project.id,
          userMessage: trimmed,
          locale,
        }),
        signal: ac.signal,
      });

      if (response.status === 429) {
        setError(t("errorRateLimited"));
        setDebateState({ phase: "idle" });
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: prev.CEO!.messages.filter((m) => m.id !== userMsgId),
          },
        }));
        return;
      }

      if (response.status === 403) {
        let when = locale === "en" ? "soon" : "bientôt";
        try {
          const j = await response.json();
          if (j?.nextAvailableAt) {
            when = new Date(j.nextAvailableAt).toLocaleDateString(
              locale === "en" ? "en-US" : "fr-FR",
              { day: "numeric", month: "long" }
            );
          }
        } catch {}
        setError(t("debateRecharge", { when }));
        setDebateState({ phase: "idle" });
        setAgentData((prev) => ({
          ...prev,
          CEO: { ...prev.CEO!, messages: prev.CEO!.messages.filter((m) => m.id !== userMsgId) },
        }));
        return;
      }
      if (response.status === 403) {
        setError(t("errorPlanRequired"));
        setDebateState({ phase: "idle" });
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: prev.CEO!.messages.filter((m) => m.id !== userMsgId),
          },
        }));
        return;
      }
      if (!response.ok || !response.body) throw new Error("Debate v2 failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let currentAgent: DebateAgentRole | null = null;
      let inCeoCall = false;
      let turnIndex = 0;
      let messages: import("@/lib/types/debate").DebateMessage[] = [];
      let ceoCall = "";
      let selection: AgentSelection | null = null;
      const lateJoinAgents = new Set<DebateAgentRole>();
      let consensusVotes: ConsensusVote[] = [];

      const upsertTurn = (
        agent: DebateAgentRole,
        idx: number,
        contentDelta: string,
        streaming: boolean,
        isLateJoin?: boolean
      ) => {
        messages = [...messages];
        const pos = messages.findIndex((m) => m.agent === agent && m.turnIndex === idx);
        if (pos === -1) {
          messages.push({
            id: `${agent}-t${idx}-${Date.now()}`,
            agent,
            turnIndex: idx,
            content: contentDelta,
            isStreaming: streaming,
            isLateJoin,
          });
        } else {
          messages[pos] = {
            ...messages[pos],
            content: messages[pos].content + contentDelta,
            isStreaming: streaming,
          };
        }
      };

      const finalizeTurn = (agent: DebateAgentRole, idx: number) => {
        messages = messages.map((m) =>
          m.agent === agent && m.turnIndex === idx ? { ...m, isStreaming: false } : m
        );
      };

      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        streamDone = done;
        if (!done && value) buffer += decoder.decode(value, { stream: true });

        let madeProgress = true;
        while (madeProgress) {
          madeProgress = false;

          // [[META]]{json}[[/META]]
          const metaMatch = buffer.match(/^\[\[META\]\]([\s\S]*?)\[\[\/META\]\]/);
          if (metaMatch) {
            try {
              selection = JSON.parse(metaMatch[1]) as AgentSelection;
              if (selection) setDebateState({ phase: "threading", question: trimmed, selection, messages: [] });
            } catch { /* ignore */ }
            buffer = buffer.slice(metaMatch[0].length);
            madeProgress = true;
            continue;
          }

          // [[THREAD]] / [[/THREAD]]
          const threadBound = buffer.match(/^\[\[\/?THREAD\]\]/);
          if (threadBound) {
            buffer = buffer.slice(threadBound[0].length);
            madeProgress = true;
            continue;
          }

          // [[SURPRISE_JOIN:CFO]]
          const surpriseMatch = buffer.match(/^\[\[SURPRISE_JOIN:([A-Z]+)\]\]/);
          if (surpriseMatch) {
            const surpriseAgent = surpriseMatch[1] as DebateAgentRole;
            if (selection && !selection.agents.includes(surpriseAgent)) {
              lateJoinAgents.add(surpriseAgent);
              selection = {
                ...selection,
                agents: [...selection.agents, surpriseAgent],
                lateJoins: [...(selection.lateJoins ?? []), surpriseAgent],
              };
              setDebateState({ phase: "threading", question: trimmed, selection, messages: [...messages] });
            }
            buffer = buffer.slice(surpriseMatch[0].length);
            madeProgress = true;
            continue;
          }

          // [[TURN:CFO]]
          const turnStart = buffer.match(/^\[\[TURN:([A-Z]+)\]\]/);
          if (turnStart) {
            const agentRole = turnStart[1] as DebateAgentRole;
            currentAgent = agentRole;
            const isFirstTurnForAgent = !messages.some((m) => m.agent === agentRole);
            const isLateJoin = lateJoinAgents.has(agentRole) && isFirstTurnForAgent;
            upsertTurn(agentRole, turnIndex, "", true, isLateJoin);
            if (selection) setDebateState({ phase: "threading", question: trimmed, selection, messages: [...messages] });
            buffer = buffer.slice(turnStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[/TURN:CFO]]
          const turnEnd = buffer.match(/^\[\[\/TURN:([A-Z]+)\]\]/);
          if (turnEnd) {
            const agentRole = turnEnd[1] as DebateAgentRole;
            finalizeTurn(agentRole, turnIndex);
            turnIndex++;
            currentAgent = null;
            if (selection) setDebateState({ phase: "threading", question: trimmed, selection, messages: [...messages] });
            buffer = buffer.slice(turnEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[CEO_CALL]]
          const ceoStart = buffer.match(/^\[\[CEO_CALL\]\]/);
          if (ceoStart) {
            inCeoCall = true;
            currentAgent = null;
            if (selection) setDebateState({ phase: "deciding", question: trimmed, selection, messages: [...messages], ceoCall: "" });
            buffer = buffer.slice(ceoStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[/CEO_CALL]]
          const ceoEnd = buffer.match(/^\[\[\/CEO_CALL\]\]/);
          if (ceoEnd) {
            inCeoCall = false;
            // Transition to "revealing" — consensus arrives next
            if (selection) setDebateState({ phase: "revealing", question: trimmed, selection, messages: [...messages], ceoCall, consensus: [], tensionMap: null });
            buffer = buffer.slice(ceoEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[WHISPER:CMO]]text[[/WHISPER:CMO]] — complete block
          const whisperMatch = buffer.match(/^\[\[WHISPER:([A-Z]+)\]\]([\s\S]*?)\[\[\/WHISPER:\1\]\]/);
          if (whisperMatch) {
            const whisperAgent = whisperMatch[1] as DebateAgentRole;
            const whisperText = whisperMatch[2].trim();
            if (whisperText) {
              // Patch the last message by this agent with the whisper text
              let lastIdx = -1;
              messages.forEach((m, i) => { if (m.agent === whisperAgent) lastIdx = i; });
              if (lastIdx >= 0) {
                messages = messages.map((m, i) => i === lastIdx ? { ...m, whisper: whisperText } : m);
                if (selection) setDebateState({ phase: "threading", question: trimmed, selection, messages: [...messages] });
              }
            }
            buffer = buffer.slice(whisperMatch[0].length);
            madeProgress = true;
            continue;
          }

          // [[CONSENSUS_START]]
          const consensusStart = buffer.match(/^\[\[CONSENSUS_START\]\]/);
          if (consensusStart) {
            if (selection) setDebateState({ phase: "revealing", question: trimmed, selection, messages: [...messages], ceoCall, consensus: [], tensionMap: null });
            buffer = buffer.slice(consensusStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[VOTE:CTO:reluctant]]note[[/VOTE:CTO]]
          const voteMatch = buffer.match(/^\[\[VOTE:([A-Z]+):([a-z]+)\]\]([\s\S]*?)\[\[\/VOTE:\1\]\]/);
          if (voteMatch) {
            const voteAgent = voteMatch[1] as DebateAgentRole;
            const voteVerdict = voteMatch[2] as VoteVerdict;
            const voteNote = voteMatch[3].trim();
            consensusVotes = [...consensusVotes, { agent: voteAgent, verdict: voteVerdict, note: voteNote }];
            if (selection) setDebateState({ phase: "revealing", question: trimmed, selection, messages: [...messages], ceoCall, consensus: [...consensusVotes], tensionMap: null });
            buffer = buffer.slice(voteMatch[0].length);
            madeProgress = true;
            continue;
          }

          // [[CONSENSUS_END]]
          const consensusEnd = buffer.match(/^\[\[CONSENSUS_END\]\]/);
          if (consensusEnd) {
            buffer = buffer.slice(consensusEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[END]]
          const endMatch = buffer.match(/^\[\[END\]\]/);
          if (endMatch) {
            if (selection) setDebateState({ phase: "done", question: trimmed, selection, messages: [...messages], ceoCall, consensus: [...consensusVotes], tensionMap: null });
            buffer = buffer.slice(endMatch[0].length);
            streamDone = true;
            madeProgress = true;
            continue;
          }

          // [[ERROR]]msg[[/ERROR]]
          const errMatch = buffer.match(/^\[\[ERROR\]\]([\s\S]*?)\[\[\/ERROR\]\]/);
          if (errMatch) {
            setDebateState({ phase: "error", message: errMatch[1] });
            buffer = buffer.slice(errMatch[0].length);
            streamDone = true;
            madeProgress = true;
            continue;
          }

          // Drain plain text
          if (buffer.length > 0 && !buffer.startsWith("[[")) {
            const nextMarkerIdx = buffer.indexOf("[[");
            const drainable = nextMarkerIdx === -1 ? buffer : buffer.slice(0, nextMarkerIdx);
            if (drainable) {
              if (inCeoCall) {
                ceoCall += drainable;
                if (selection) setDebateState({ phase: "deciding", question: trimmed, selection, messages: [...messages], ceoCall });
              } else if (currentAgent !== null) {
                upsertTurn(currentAgent, turnIndex, drainable, true);
                if (selection) setDebateState({ phase: "threading", question: trimmed, selection, messages: [...messages] });
              }
              buffer = buffer.slice(drainable.length);
              madeProgress = true;
            }
          }
        }
      }

      setUsageUsed((u) => u + 1);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setDebateState((prev) => {
          if (prev.phase === "threading" || prev.phase === "deciding" || prev.phase === "revealing") {
            return {
              phase: "aborted",
              question: trimmed,
              messages: "messages" in prev ? prev.messages : [],
              ceoCall: "ceoCall" in prev ? (prev.ceoCall as string) : null,
            };
          }
          return { phase: "idle" };
        });
      } else {
        console.error("Debate error:", err);
        setError(t("errorGeneric"));
        setDebateState({ phase: "idle" });
      }
    } finally {
      setIsDebating(false);
      debateAbortRef.current = null;
    }
  };

  const handleAbortDebate = () => {
    debateAbortRef.current?.abort();
  };

  const handleInviteAccept = async (agent: DebateAgentRole, reason: string) => {
    if (busy || !activeConversationId) return;

    const ceoConversationId = activeConversationId;
    let targetConversationId: string;

    // Ensure invited agent's conversation is loaded
    if (agentData[agent as AgentRole]) {
      targetConversationId = agentData[agent as AgentRole]!.conversationId;
    } else {
      setSwitchingAgent(true);
      try {
        const convo = await getOrCreateConversation(project.id, agent as AgentRole);
        if (!convo) throw new Error("Failed to get conversation");
        const msgs = await listMessages(convo.id);
        setAgentData((prev) => ({
          ...prev,
          [agent]: {
            conversationId: convo.id,
            messages: toDisplayMessages(msgs),
            loaded: true,
          },
        }));
        targetConversationId = convo.id;
      } catch (err) {
        console.error("Invite agent load error:", err);
        setError(t("errorGeneric"));
        setSwitchingAgent(false);
        return;
      } finally {
        setSwitchingAgent(false);
      }
    }

    // Switch to the invited agent
    setActiveAgent(agent as AgentRole);
    setError(null);

    // Stream their response
    setIsLoading(true);
    const assistantMsgId = `assistant-invite-${Date.now()}`;

    setAgentData((prev) => ({
      ...prev,
      [agent]: {
        ...prev[agent as AgentRole]!,
        messages: [
          ...(prev[agent as AgentRole]?.messages ?? []),
          {
            id: assistantMsgId,
            role: "assistant" as const,
            content: "",
            agentRole: agent,
            isStreaming: true,
          },
        ],
      },
    }));

    try {
      const response = await fetch("/api/chat/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentConversationId: targetConversationId,
          ceoConversationId,
          projectId: project.id,
          invitedAgent: agent,
          inviteReason: reason,
          locale,
        }),
      });

      if (response.status === 403) {
        setError(t("errorPlanRequired"));
        return;
      }
      if (!response.ok || !response.body) throw new Error("Invite failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAgentData((prev) => ({
          ...prev,
          [agent]: {
            ...prev[agent as AgentRole]!,
            messages: prev[agent as AgentRole]!.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: accumulated } : m
            ),
          },
        }));
      }

      setAgentData((prev) => ({
        ...prev,
        [agent]: {
          ...prev[agent as AgentRole]!,
          messages: prev[agent as AgentRole]!.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
          ),
        },
      }));
      setUsageUsed((u) => u + 1);
    } catch (err) {
      console.error("Invite error:", err);
      setError(t("errorGeneric"));
      setAgentData((prev) => ({
        ...prev,
        [agent]: {
          ...prev[agent as AgentRole]!,
          messages: prev[agent as AgentRole]!.messages.filter((m) => m.id !== assistantMsgId),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * La navigation du projet ouvert.
   *
   * Elle ne liste plus neuf agents : Mendly est le seul interlocuteur du
   * quotidien, et les spécialistes ne se réunissent que dans la salle. Le
   * groupe « projets » reste, pour passer d'un projet à l'autre sans repasser
   * par le tableau de bord.
   */
  const navGroups: NavGroup[] = [
    {
      label: tSide("groupProject"),
      items: [
        {
          label: tSide("conversation"),
          icon: MessageSquare,
          onClick: () => handleAgentSwitch("MENDLY"),
          active: !teamRoomActive,
          disabled: busy,
        },
        {
          label: tSide("teamRoomLabel"),
          icon: Users,
          onClick: () => handleTeamRoomOpen(),
          active: teamRoomActive,
          disabled: busy,
        },
        {
          label: tSide("memory"),
          icon: Brain,
          href: `/dashboard/projects/${project.id}/memory`,
        },
        {
          label: tSide("deliverables"),
          icon: FileStack,
          href: `/dashboard/projects/${project.id}/deliverables`,
        },
      ],
    },
    {
      label: tSide("groupProjects"),
      action: { label: tSide("newProject"), href: "/dashboard/new" },
      items: allProjects.map((p) => ({
        label: p.name,
        icon: FolderClosed,
        href: `/dashboard/projects/${p.id}`,
        active: p.id === project.id,
      })),
    },
  ];

  return (
    <>
    {showIntro && (
      <TeamIntroSequence projectId={project.id} onDone={() => setShowIntro(false)} />
    )}
    <AppShell
      groups={navGroups}
      usageUsed={usageUsed}
      usageLimit={initialUsageLimit}
      userPlan={userPlan}
      userEmail={userEmail}
      contextLabel={project.name}
      flush
    >
      <SpeakingBar active={busy} />
      <AppHeader
        title={teamRoomActive ? t("teamRoomNav") : tSide("conversation")}
        subtitle={project.name}
        actions={
          !teamRoomActive && activeAgent === "CEO" ? (
            <GenerateMemoButton projectId={project.id} userPlan={userPlan} />
          ) : undefined
        }
      />

        <ProjectConsoleStrip stats={projectStats} onOpenTeamRoom={() => handleTeamRoomOpen()} />

        <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {teamRoomActive ? (
              <>
                <TeamRoomHeader project={project} />
                <AutonomousSessions projectId={project.id} />
                {(() => {
                  const debateMessages = activeMessages.filter(
                    (m) => m.role === "assistant" && m.agentRole === "DEBATE"
                  );
                  if (debateMessages.length === 0 && debateState.phase === "idle") {
                    return <TeamRoomEmptyState />;
                  }
                  return debateMessages.map((m) => {
                    const st = reconstructDebate(m.content);
                    return st ? <DebateView key={m.id} state={st} onAbort={() => {}} /> : null;
                  });
                })()}
              </>
            ) : switchingAgent ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-(--text-muted) text-sm">
                  <div className="w-2 h-2 rounded-full bg-(--accent-glow) animate-pulse" />
                  {t("agentSwitching")}
                </div>
              </div>
            ) : activeMessages.length === 0 && debateState.phase === "idle" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 md:py-24"
              >
                <div className="mb-6 flex justify-center">
                  <MendlyOrb size={104} speaking={busy} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-(--text-primary) mb-3 tracking-tight">
                  {t("welcomeTitle")}
                </h2>
                <p className="text-(--text-secondary) max-w-md mx-auto text-[15px] leading-relaxed">
                  {t(`welcomeBody${activeAgent}`, { projectName: project.name })}
                </p>
                {activeAgent === "CEO" && (
                  <div className="mt-8 max-w-md mx-auto text-left">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => handleSubmit(t("modeViabilityMsg"), "viability")}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-(--border-strong) bg-(--surface-1) text-[13px] text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-2) transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShieldQuestion className="w-4 h-4 text-(--accent-primary)" />
                        {t("modeViabilityBtn")}
                      </button>
                      <button
                        onClick={() => handleSubmit(t("modeOverwhelmedMsg"), "overwhelmed")}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-(--border-strong) bg-(--surface-1) text-[13px] text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-2) transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <LifeBuoy className="w-4 h-4 text-(--aurora-teal)" />
                        {t("modeOverwhelmedBtn")}
                      </button>
                    </div>
                    <p className="text-[12px] text-(--text-dim) mb-3">{t("starterIntro")}</p>
                    <div className="flex flex-col gap-2">
                      {[t("starter1"), t("starter2"), t("starter3")].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(q)}
                          disabled={busy}
                          className="text-left px-4 py-3 rounded-2xl border border-(--border) bg-(--surface-1) text-[14px] text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-strong) hover:bg-(--surface-2) transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              activeMessages.map((m) => {
                if (m.role === "assistant" && m.agentRole === "DEBATE") {
                  const st = reconstructDebate(m.content);
                  if (st) return <DebateView key={m.id} state={st} onAbort={() => {}} />;
                }
                return (
                  <div key={m.id}>
                    <ChatMessage
                      role={m.role}
                      content={m.content}
                      agentRole={m.agentRole}
                      isStreaming={m.isStreaming}
                      attachmentName={m.attachmentName}
                      attachmentMime={m.attachmentMime}
                      onInviteAccept={handleInviteAccept}
                      busy={busy}
                    />
                    {m.roomSuggestion && !m.isStreaming && (
                      <button
                        onClick={() => handleTeamRoomOpen(m.roomSuggestion ?? undefined)}
                        disabled={busy}
                        className="mt-3 flex w-full items-start gap-3 rounded-2xl border border-(--accent-primary)/35 bg-(--accent-primary)/8 px-4 py-3 text-left transition-colors hover:bg-(--accent-primary)/14 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow) cursor-pointer"
                      >
                        <Users className="mt-0.5 size-4 shrink-0 text-(--accent-glow)" />
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-(--accent-glow)">
                            {t("openRoomLabel")}
                          </span>
                          <span className="mt-0.5 block text-sm text-white">{m.roomSuggestion}</span>
                        </span>
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Live debate renders in DebateView below; the ambient aura conveys "speaking". */}

            {debateState.phase !== "idle" && (
              <DebateView state={debateState} onAbort={handleAbortDebate} />
            )}

            {error && (
              <div
                role="alert"
                className="px-4 py-3 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm"
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="relative z-10">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={teamRoomActive ? handleDebate : handleSubmit}
            busy={busy}
            isDebating={isDebating}
            agentLabel={teamRoomActive ? t("teamRoomNav") : AGENT_LABELS[activeAgent]}
            selectedFile={selectedFile}
            onFileChange={setSelectedFile}
          />
        </div>
    </AppShell>
    </>
  );
}
