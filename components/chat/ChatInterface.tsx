"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { GenerateMemoButton } from "./GenerateMemoButton";
import { ProjectSidebar } from "@/components/dashboard/ProjectSidebar";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import type { Message, AgentRole } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";
import type { FileAttachment } from "@/lib/ai/gemini";

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
  const [agentData, setAgentData] = useState<
    Partial<Record<AgentRole, AgentState>>
  >({
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
  const [error, setError] = useState<string | null>(null);
  const [usageUsed, setUsageUsed] = useState(initialUsageUsed);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeData = agentData[activeAgent];
  const activeMessages = activeData?.messages ?? [];
  const activeConversationId = activeData?.conversationId ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeAgent]);

  const busy = isLoading || isDebating || switchingAgent;

  const handleAgentSwitch = async (agent: AgentRole) => {
    if (agent === activeAgent || busy) return;
    setActiveAgent(agent);
    setError(null);

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
          messages: prev[activeAgent]!.messages.filter(
            (m) => m.id !== assistantMsgId
          ),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebate = async () => {
    const trimmed = input.trim();
    if (!trimmed || busy || activeAgent !== "CEO" || !activeConversationId)
      return;

    setError(null);
    setInput("");
    setIsDebating(true);

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

    try {
      const response = await fetch("/api/chat/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          projectId: project.id,
          userMessage: trimmed,
          locale,
        }),
      });

      if (response.status === 429) {
        setError(t("errorRateLimited"));
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: prev.CEO!.messages.filter((m) => m.id !== userMsgId),
          },
        }));
        return;
      }
      if (!response.ok || !response.body) throw new Error("Debate failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentAgent: string | null = null;
      let currentMsgId: string | null = null;

      const startNewRound = (agent: string) => {
        const newId = `${agent.toLowerCase()}-debate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        currentAgent = agent;
        currentMsgId = newId;
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: [
              ...prev.CEO!.messages,
              {
                id: newId,
                role: "assistant",
                content: "",
                agentRole: agent,
                isStreaming: true,
              },
            ],
          },
        }));
      };

      const appendToCurrent = (text: string) => {
        if (!currentMsgId) return;
        const id = currentMsgId;
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: prev.CEO!.messages.map((m) =>
              m.id === id ? { ...m, content: m.content + text } : m
            ),
          },
        }));
      };

      const finalizeCurrent = () => {
        if (!currentMsgId) return;
        const id = currentMsgId;
        setAgentData((prev) => ({
          ...prev,
          CEO: {
            ...prev.CEO!,
            messages: prev.CEO!.messages.map((m) =>
              m.id === id ? { ...m, isStreaming: false } : m
            ),
          },
        }));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let markerIdx;
        while ((markerIdx = buffer.indexOf("[[ROUND:")) !== -1) {
          if (markerIdx > 0) {
            const beforeText = buffer.slice(0, markerIdx);
            if (currentAgent) appendToCurrent(beforeText);
            buffer = buffer.slice(markerIdx);
          }
          const endIdx = buffer.indexOf("]]");
          if (endIdx === -1) break;
          const marker = buffer.slice(8, endIdx);
          buffer = buffer.slice(endIdx + 2);

          if (marker === "END") {
            finalizeCurrent();
            currentAgent = null;
            currentMsgId = null;
          } else {
            finalizeCurrent();
            startNewRound(marker);
          }
        }

        if (buffer.length > 0 && currentAgent && !buffer.includes("[[")) {
          appendToCurrent(buffer);
          buffer = "";
        }
      }

      if (buffer.length > 0 && currentAgent) appendToCurrent(buffer);
      finalizeCurrent();
      setUsageUsed((u) => u + 1);
    } catch (err) {
      console.error("Debate error:", err);
      setError(t("errorGeneric"));
    } finally {
      setIsDebating(false);
    }
  };

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      {/* Left sidebar */}
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

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
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

          {activeAgent === "CEO" && (
            <GenerateMemoButton projectId={project.id} />
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {switchingAgent ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-(--text-muted) text-sm">
                  <div className="w-2 h-2 rounded-full bg-(--accent-glow) animate-pulse" />
                  {t("agentSwitching")}
                </div>
              </div>
            ) : activeMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 md:py-24"
              >
                <div className="w-14 h-14 rounded-2xl bg-(--surface-elevated) border border-(--border-strong) flex items-center justify-center mx-auto mb-6 text-base font-bold font-mono text-(--text-primary)">
                  {activeAgent[0]}
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
                />
              ))
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

        {/* Composer */}
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