"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { DebateView } from "./DebateView";
import { GenerateMemoButton } from "./GenerateMemoButton";
import { ProjectSidebar } from "@/components/dashboard/ProjectSidebar";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import type { Message, AgentRole } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";
import type { FileAttachment } from "@/lib/ai/gemini";
import type { DebateState, DebateAgentRole, AgentSelection } from "@/lib/types/debate";

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
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentRole?: string | null;
  isStreaming?: boolean;
  attachmentName?: string | null;
  attachmentMime?: string | null;
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
};

function toDisplayMessages(messages: Message[]): DisplayMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    agentRole: m.agent_role,
  }));
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
}: ChatInterfaceProps) {
  const t = useTranslations("chat");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentRole>("CEO");
  const [switchingAgent, setSwitchingAgent] = useState(false);
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

  const busy = isLoading || isDebating || switchingAgent;

  const handleAgentSwitch = async (agent: AgentRole) => {
    if (agent === activeAgent || busy) return;
    setActiveAgent(agent);
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

  const handleSubmit = async () => {
    const trimmed = input.trim();
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
      if (!response.ok || !response.body) throw new Error("Failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAgentData((prev) => ({
          ...prev,
          [activeAgent]: {
            ...prev[activeAgent]!,
            messages: prev[activeAgent]!.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: accumulated } : m
            ),
          },
        }));
      }

      setAgentData((prev) => ({
        ...prev,
        [activeAgent]: {
          ...prev[activeAgent]!,
          messages: prev[activeAgent]!.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
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
    if (!trimmed || busy || activeAgent !== "CEO" || !activeConversationId) return;

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
      if (!response.ok || !response.body) throw new Error("Debate v2 failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      type Round = 1 | 2;
      let currentAgent: DebateAgentRole | null = null;
      let currentRound: Round | null = null;
      let inSynthesis = false;
      let messages: import("@/lib/types/debate").DebateMessage[] = [];
      let synthesis = "";
      let selection: AgentSelection | null = null;

      const upsertMessage = (
        agent: DebateAgentRole,
        round: Round,
        contentDelta: string,
        streaming: boolean
      ) => {
        messages = [...messages];
        const idx = messages.findIndex((m) => m.agent === agent && m.round === round);
        if (idx === -1) {
          messages.push({
            id: `${agent}-r${round}-${Date.now()}`,
            agent,
            round,
            content: contentDelta,
            isStreaming: streaming,
          });
        } else {
          messages[idx] = {
            ...messages[idx],
            content: messages[idx].content + contentDelta,
            isStreaming: streaming,
          };
        }
      };

      const finalizeMessage = (agent: DebateAgentRole, round: Round) => {
        messages = messages.map((m) =>
          m.agent === agent && m.round === round ? { ...m, isStreaming: false } : m
        );
      };

      const flushState = (
        phase: "round1" | "round2" | "synthesizing" | "done",
        sel: AgentSelection,
        msgs: typeof messages,
        synth: string | null
      ) => {
        if (phase === "synthesizing" || phase === "done") {
          setDebateState({ phase, question: trimmed, selection: sel, messages: msgs, synthesis: synth ?? "" });
        } else {
          setDebateState({ phase, question: trimmed, selection: sel, messages: msgs });
        }
      };

      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        streamDone = done;
        if (!done && value) buffer += decoder.decode(value, { stream: true });

        // Inner loop: process all complete tokens in buffer before fetching next chunk
        let madeProgress = true;
        while (madeProgress) {
          madeProgress = false;

          // All patterns are anchored with ^ so they only match at the buffer head.
          // Text is drained last, ensuring markers are only at the front when checked.

          // [[META]]{json}[[/META]]
          const metaMatch = buffer.match(/^\[\[META\]\]([\s\S]*?)\[\[\/META\]\]/);
          if (metaMatch) {
            try {
              selection = JSON.parse(metaMatch[1]) as AgentSelection;
              if (selection) setDebateState({ phase: "round1", question: trimmed, selection, messages: [] });
            } catch { /* ignore bad json */ }
            buffer = buffer.slice(metaMatch[0].length);
            madeProgress = true;
            continue;
          }

          // [[ROUND:1]] / [[ROUND:2]]
          const roundStart = buffer.match(/^\[\[ROUND:(1|2)\]\]/);
          if (roundStart) {
            const roundNum = (roundStart[1] === "1" ? 1 : 2) as Round;
            currentRound = roundNum;
            if (selection) flushState(roundNum === 1 ? "round1" : "round2", selection, messages, null);
            buffer = buffer.slice(roundStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[/ROUND:1]] / [[/ROUND:2]]
          const roundEnd = buffer.match(/^\[\[\/ROUND:(1|2)\]\]/);
          if (roundEnd) {
            buffer = buffer.slice(roundEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[AGENT:CFO:1]]
          const agentStart = buffer.match(/^\[\[AGENT:([A-Z]+):(1|2)\]\]/);
          if (agentStart) {
            const agentRole = agentStart[1] as DebateAgentRole;
            const round = (agentStart[2] === "1" ? 1 : 2) as Round;
            currentAgent = agentRole;
            currentRound = round;
            upsertMessage(agentRole, round, "", true);
            if (selection) flushState(round === 1 ? "round1" : "round2", selection, messages, null);
            buffer = buffer.slice(agentStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[/AGENT:CFO:1]]
          const agentEnd = buffer.match(/^\[\[\/AGENT:([A-Z]+):(1|2)\]\]/);
          if (agentEnd) {
            const agentRole = agentEnd[1] as DebateAgentRole;
            const round = (agentEnd[2] === "1" ? 1 : 2) as Round;
            finalizeMessage(agentRole, round);
            currentAgent = null;
            if (selection) flushState(round === 1 ? "round1" : "round2", selection, messages, null);
            buffer = buffer.slice(agentEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[SYNTHESIS]]
          const synthStart = buffer.match(/^\[\[SYNTHESIS\]\]/);
          if (synthStart) {
            inSynthesis = true;
            currentAgent = null;
            if (selection) flushState("synthesizing", selection, messages, synthesis || "");
            buffer = buffer.slice(synthStart[0].length);
            madeProgress = true;
            continue;
          }

          // [[/SYNTHESIS]]
          const synthEnd = buffer.match(/^\[\[\/SYNTHESIS\]\]/);
          if (synthEnd) {
            inSynthesis = false;
            if (selection) flushState("done", selection, messages, synthesis);
            buffer = buffer.slice(synthEnd[0].length);
            madeProgress = true;
            continue;
          }

          // [[END]]
          const endMatch = buffer.match(/^\[\[END\]\]/);
          if (endMatch) {
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

          // Drain plain text (up to the next marker, or all of buffer if no marker).
          // This must run last so markers are only matched when at the buffer head.
          if (buffer.length > 0 && !buffer.startsWith("[[")) {
            const nextMarkerIdx = buffer.indexOf("[[");
            const drainable = nextMarkerIdx === -1 ? buffer : buffer.slice(0, nextMarkerIdx);
            if (drainable) {
              if (inSynthesis) {
                synthesis += drainable;
                if (selection) flushState("synthesizing", selection, messages, synthesis);
              } else if (currentAgent && currentRound !== null) {
                upsertMessage(currentAgent, currentRound, drainable, true);
                if (selection) flushState(currentRound === 1 ? "round1" : "round2", selection, messages, null);
              }
              buffer = buffer.slice(drainable.length);
              madeProgress = true;
            }
          }
          // If buffer starts with [[ and no complete marker matched, wait for more data
        }
      }

      setUsageUsed((u) => u + 1);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setDebateState((prev) => {
          if (prev.phase === "round1" || prev.phase === "round2" || prev.phase === "synthesizing") {
            return {
              phase: "aborted",
              question: trimmed,
              messages: "messages" in prev ? prev.messages : [],
              synthesis: prev.phase === "synthesizing" ? prev.synthesis : null,
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

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <ProjectSidebar
        projects={allProjects}
        activeProjectId={project.id}
        activeAgent={activeAgent}
        onAgentChange={handleAgentSwitch}
        agentBusy={busy}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        usageUsed={usageUsed}
        usageLimit={initialUsageLimit}
        userPlan={userPlan}
        userEmail={userEmail}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 border-b border-(--border) flex items-center justify-between px-4 md:px-6 bg-(--bg-primary)/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface) transition-colors cursor-pointer"
                title={t("expandSidebar")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-mono tracking-[0.25em] text-(--text-dim) uppercase">
                {project.name}
              </p>
              <p className="text-sm font-bold text-(--text-primary) truncate">
                {t("chattingWith")} {AGENT_LABELS[activeAgent]}
              </p>
            </div>
          </div>

          {activeAgent === "CEO" && <GenerateMemoButton projectId={project.id} />}
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {switchingAgent ? (
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
                <div className="w-14 h-14 rounded-2xl bg-(--surface-elevated) border border-(--border-strong) flex items-center justify-center mx-auto mb-6 text-sm font-bold font-mono text-(--text-primary) tracking-wider">
                  {activeAgent}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-(--text-primary) mb-3 tracking-tight">
                  {t("welcomeTitle")}
                </h2>
                <p className="text-(--text-secondary) max-w-md mx-auto text-[15px] leading-relaxed">
                  {t(`welcomeBody${activeAgent}`, { projectName: project.name })}
                </p>
              </motion.div>
            ) : (
              activeMessages.map((m) => (
                <ChatMessage
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  agentRole={m.agentRole}
                  isStreaming={m.isStreaming}
                  attachmentName={m.attachmentName}
                  attachmentMime={m.attachmentMime}
                  onInviteAccept={activeAgent === "CEO" ? handleInviteAccept : undefined}
                  busy={busy}
                />
              ))
            )}

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

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onDebate={handleDebate}
          busy={busy}
          isDebating={isDebating}
          canDebate={activeAgent === "CEO"}
          agentLabel={AGENT_LABELS[activeAgent]}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
        />
      </main>
    </div>
  );
}
