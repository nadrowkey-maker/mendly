"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Zap, FileStack } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { GenerateMemoButton } from "./GenerateMemoButton";
import {
  getOrCreateConversation,
  listMessages,
} from "@/lib/actions/conversations";
import type { Message } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";
import type { AgentRole } from "@/lib/types/conversation";

interface ChatInterfaceProps {
  project: Project;
  conversationId: string;
  initialMessages: Message[];
  locale: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentRole?: string | null;
  isStreaming?: boolean;
}

interface AgentState {
  conversationId: string;
  messages: DisplayMessage[];
  loaded: boolean;
}

const AGENT_CONFIG: { role: AgentRole; color: string; labelKey: string }[] = [
    { role: "CEO", color: "#8B5CF6", labelKey: "CEO" },
    { role: "CTO", color: "#06B6D4", labelKey: "CTO" },
    { role: "CMO", color: "#F0ABFC", labelKey: "CMO" },
    { role: "CPO", color: "#FB923C", labelKey: "CPO" },
    { role: "CFO", color: "#34D399", labelKey: "CFO" },
    { role: "CDO", color: "#60A5FA", labelKey: "CDO" },
    { role: "DEV", color: "#FBBF24", labelKey: "DEV" },
    { role: "CCO", color: "#F472B6", labelKey: "CCO" },
  ];

const AGENT_COLORS: Record<string, string> = {
    CEO: "#8B5CF6",
    CTO: "#06B6D4",
    CMO: "#F0ABFC",
    CPO: "#FB923C",
    CFO: "#34D399",
    CDO: "#60A5FA",
    DEV: "#FBBF24",
    CCO: "#F472B6",
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
}: ChatInterfaceProps) {
  const t = useTranslations("chat");

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
  const [isLoading, setIsLoading] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeData = agentData[activeAgent];
  const activeMessages = activeData?.messages ?? [];
  const activeConversationId = activeData?.conversationId ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeAgent]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const handleAgentSwitch = async (agent: AgentRole) => {
    if (agent === activeAgent || isLoading || isDebating) return;
    setActiveAgent(agent);
    setError(null);

    if (agentData[agent]) return;

    setSwitchingAgent(true);
    try {
      const convo = await getOrCreateConversation(project.id, agent);
      if (!convo) throw new Error("Failed to create conversation");
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

  /**
   * Sends a normal message to the active agent (no debate).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || isDebating || !activeConversationId) return;

    setError(null);
    setInput("");
    setIsLoading(true);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    setAgentData((prev) => ({
      ...prev,
      [activeAgent]: {
        ...prev[activeAgent]!,
        messages: [
          ...(prev[activeAgent]?.messages ?? []),
          { id: userMsgId, role: "user", content: trimmed },
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
        }),
      });

      if (!response.ok || !response.body)
        throw new Error("Failed to send message");

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

  /**
   * Triggers a 3-agent DEBATE. Only available on CEO conversation.
   * Streams parsed by [[ROUND:XXX]] markers and rendered as separate messages.
   */
  const handleDebate = async () => {
    const trimmed = input.trim();
    if (
      !trimmed ||
      isLoading ||
      isDebating ||
      !activeConversationId ||
      activeAgent !== "CEO"
    )
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

      const finalizeCurrentRound = () => {
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

        // Process all complete markers found
        let markerIdx;
        while ((markerIdx = buffer.indexOf("[[ROUND:")) !== -1) {
          // Text before the marker belongs to the current round
          if (markerIdx > 0) {
            const beforeText = buffer.slice(0, markerIdx);
            if (currentAgent) appendToCurrent(beforeText);
            buffer = buffer.slice(markerIdx);
          }

          // Find end of marker
          const endIdx = buffer.indexOf("]]");
          if (endIdx === -1) break; // marker incomplete, wait for next chunk

          const marker = buffer.slice(8, endIdx); // "CTO" / "CMO" / "CEO" / "END"
          buffer = buffer.slice(endIdx + 2);

          if (marker === "END") {
            finalizeCurrentRound();
            currentAgent = null;
            currentMsgId = null;
          } else {
            // Finalize previous round, start new
            finalizeCurrentRound();
            startNewRound(marker);
          }
        }

        // Any remaining text without a new marker → append to current round
        if (buffer.length > 0 && currentAgent && !buffer.includes("[[")) {
          appendToCurrent(buffer);
          buffer = "";
        }
      }

      // Stream ended — finalize any open round
      if (buffer.length > 0 && currentAgent) {
        appendToCurrent(buffer);
      }
      finalizeCurrentRound();
    } catch (err) {
      console.error("Debate error:", err);
      setError(t("errorGeneric"));
    } finally {
      setIsDebating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const activeConfig = AGENT_CONFIG.find((a) => a.role === activeAgent)!;
  const busy = isLoading || isDebating || switchingAgent;

  return (
    <main className="relative flex flex-col h-screen bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${activeConfig.color}08 0%, transparent 70%)`,
          transition: "background 0.4s ease",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-(--border) bg-(--bg-primary)/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors shrink-0"
          >
            ← {t("backToDashboard")}
          </Link>

          <div className="flex items-center gap-1 p-1 rounded-full border border-(--border) bg-(--surface)/40 overflow-x-auto max-w-[60vw] md:max-w-none scrollbar-thin">
    {AGENT_CONFIG.map((agent) => {
      const isActive = activeAgent === agent.role;
      return (
        <button
          key={agent.role}
          onClick={() => handleAgentSwitch(agent.role)}
          disabled={busy}
          className="relative px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          style={{
            color: isActive ? "#05030E" : agent.color,
            background: isActive ? agent.color : "transparent",
            boxShadow: isActive ? `0 0 20px ${agent.color}60` : "none",
          }}
        >
          {agent.role}
        </button>
      );
    })}
  </div>

          {activeAgent === "CEO" ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/projects/${project.id}/deliverables`}
                title={t("myDeliverables")}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-(--border-strong) bg-(--surface)/40 hover:bg-(--surface)/60 hover:border-(--accent-glow)/50 transition-all text-xs font-mono uppercase tracking-wider text-(--text-muted) hover:text-white"
              >
                <FileStack className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t("myDeliverables")}</span>
              </Link>
              <GenerateMemoButton projectId={project.id} />
            </div>
          ) : (
            <div className="w-[120px]" />
          )}
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-8 pb-2 text-center">
          <p className="text-xs text-(--text-dim) truncate">{project.name}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {switchingAgent ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-(--text-dim) text-sm">
                <span
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ background: activeConfig.color }}
                />
                {t("agentSwitching")}
              </div>
            </div>
          ) : activeMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold font-mono"
                style={{
                  background: `${activeConfig.color}20`,
                  border: `1px solid ${activeConfig.color}40`,
                  color: activeConfig.color,
                  boxShadow: `0 0 32px ${activeConfig.color}30`,
                }}
              >
                {activeAgent[0]}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {t("welcomeTitle")}
              </h2>
              <p className="text-(--text-muted) max-w-md mx-auto mb-6">
                {t(`welcomeBody${activeAgent}`, { projectName: project.name })}
              </p>
              <p className="text-xs text-(--text-dim) font-mono">
                {t("startTyping")}
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
              />
            ))
          )}

          {error && (
            <div
              role="alert"
              className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-(--border) bg-(--bg-primary)/80 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto px-6 md:px-8 py-4"
        >
          <div
            className="flex items-end gap-2 rounded-2xl border p-2 transition-colors"
            style={{
              borderColor: busy
                ? `${activeConfig.color}50`
                : "var(--border-strong)",
              background: "var(--surface-elevated, rgba(28,23,54,0.4))",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              rows={1}
              disabled={busy}
              className="flex-1 px-3 py-2 bg-transparent text-white placeholder-(--text-dim) focus:outline-none resize-none disabled:opacity-50 max-h-40 text-sm leading-relaxed"
            />

            {/* Debate button — only on CEO */}
            {activeAgent === "CEO" && (
              <button
                type="button"
                onClick={handleDebate}
                disabled={busy || !input.trim()}
                title={t("debateTooltip")}
                className="px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border"
                style={{
                  borderColor: "#F0ABFC",
                  color: isDebating ? "#05030E" : "#F0ABFC",
                  background: isDebating ? "#F0ABFC" : "transparent",
                  boxShadow: isDebating ? "0 0 24px #F0ABFC80" : "none",
                }}
              >
                {isDebating ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden md:inline">{t("debating")}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{t("debate")}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              style={{
                background: activeConfig.color,
                color: "#05030E",
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.3s]" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="hidden md:inline">{t("send")}</span>
                  <span>↑</span>
                </span>
              )}
            </button>
          </div>
          <p className="text-[10px] text-(--text-dim) text-center mt-2 font-mono">
            {activeAgent === "CEO" ? t("shortcutWithDebate") : t("shortcut")}
          </p>
        </form>
      </div>
    </main>
  );
}