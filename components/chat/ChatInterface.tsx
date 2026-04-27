"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { GenerateMemoButton } from "./GenerateMemoButton";
import { getOrCreateConversation, listMessages } from "@/lib/actions/conversations";
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
];

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
  const [agentData, setAgentData] = useState<Partial<Record<AgentRole, AgentState>>>({
    CEO: {
      conversationId,
      messages: toDisplayMessages(initialMessages),
      loaded: true,
    },
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    if (agent === activeAgent || isLoading) return;
    setActiveAgent(agent);
    setError(null);

    if (agentData[agent]) return; // already loaded

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || !activeConversationId) return;

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
          { id: assistantMsgId, role: "assistant", content: "", agentRole: activeAgent, isStreaming: true },
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

      if (!response.ok || !response.body) throw new Error("Failed to send message");

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
          messages: prev[activeAgent]!.messages.filter((m) => m.id !== assistantMsgId),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const activeConfig = AGENT_CONFIG.find((a) => a.role === activeAgent)!;

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

          {/* Agent tabs */}
          <div className="flex items-center gap-1 p-1 rounded-full border border-(--border) bg-(--surface)/40">
            {AGENT_CONFIG.map((agent) => {
              const isActive = activeAgent === agent.role;
              return (
                <button
                  key={agent.role}
                  onClick={() => handleAgentSwitch(agent.role)}
                  disabled={isLoading || switchingAgent}
                  className="relative px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <GenerateMemoButton projectId={project.id} />
          ) : (
            <div className="w-[120px]" /> // spacer to keep layout balanced
          )}
        </div>

        {/* Project name */}
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
                {t(`welcomeTitle`)}
              </h2>
              <p className="text-(--text-muted) max-w-md mx-auto mb-6">
                {t(`welcomeBody${activeAgent}`, { projectName: project.name })}
              </p>
              <p className="text-xs text-(--text-dim) font-mono">{t("startTyping")}</p>
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 md:px-8 py-4">
          <div
            className="flex items-end gap-3 rounded-2xl border p-2 transition-colors"
            style={{
              borderColor: isLoading ? `${activeConfig.color}50` : "var(--border-strong)",
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
              disabled={isLoading || switchingAgent}
              className="flex-1 px-3 py-2 bg-transparent text-white placeholder-(--text-dim) focus:outline-none resize-none disabled:opacity-50 max-h-40 text-sm leading-relaxed"
            />
            <button
              type="submit"
              disabled={isLoading || switchingAgent || !input.trim()}
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
            {t("shortcut")}
          </p>
        </form>
      </div>
    </main>
  );
}