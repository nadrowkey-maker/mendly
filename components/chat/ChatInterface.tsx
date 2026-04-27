"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "@/lib/types/conversation";
import type { Project } from "@/lib/types/project";
import { GenerateMemoButton } from "./GenerateMemoButton";

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

export function ChatInterface({
  project,
  conversationId,
  initialMessages,
  locale,
}: ChatInterfaceProps) {
  const t = useTranslations("chat");

  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      agentRole: m.agent_role,
    }))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: trimmed,
      },
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        agentRole: "CEO",
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          projectId: project.id,
          userMessage: trimmed,
          locale,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the assistant message with accumulated content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: accumulated, isStreaming: true }
              : m
          )
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      console.error("Chat error:", err);
      setError(t("errorGeneric"));
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
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

  return (
    <main className="relative flex flex-col h-screen bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-(--border) bg-(--bg-primary)/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors"
          >
            ← {t("backToDashboard")}
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase">
              {t("chattingWith")} CEO
            </p>
            <h1 className="text-sm md:text-base font-bold text-white truncate max-w-[200px] md:max-w-none">
              {project.name}
            </h1>
          </div>
 
          <GenerateMemoButton projectId={project.id} />
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-6">👋</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {t("welcomeTitle")}
              </h2>
              <p className="text-(--text-muted) max-w-md mx-auto mb-6">
                {t("welcomeBody", { projectName: project.name })}
              </p>
              <p className="text-xs text-(--text-dim) font-mono">
                {t("startTyping")}
              </p>
            </motion.div>
          ) : (
            messages.map((m) => (
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
          <div className="flex items-end gap-3 rounded-2xl border border-(--border-strong) bg-(--surface)/40 p-2 focus-within:border-(--accent-glow)/50 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              rows={1}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-transparent text-white placeholder-(--text-dim) focus:outline-none resize-none disabled:opacity-50 max-h-40 text-sm leading-relaxed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-(--accent-glow) text-(--bg-primary) font-bold text-sm hover:bg-(--accent-glow)/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
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