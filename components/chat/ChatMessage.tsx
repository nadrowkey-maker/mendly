"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agentRole?: string | null;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  agentRole,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-(--accent-glow)/10 border border-(--accent-glow)/30 text-white"
            : "bg-(--surface)/60 border border-(--border-strong) text-white"
        }`}
      >
        {!isUser && agentRole && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-(--accent-glow)" />
            <span className="text-[10px] font-mono tracking-widest text-(--accent-glow) uppercase">
              {agentRole}
            </span>
          </div>
        )}

        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-(--accent-glow) prose-strong:font-semibold prose-code:text-(--accent-warm) prose-code:bg-(--bg-primary)/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-(--accent-glow) animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}