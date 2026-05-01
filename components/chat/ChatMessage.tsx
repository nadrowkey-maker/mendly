"use client";

import ReactMarkdown from "react-markdown";
import { FileText, Image } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  agentRole?: string | null;
  isStreaming?: boolean;
  attachmentName?: string | null;
  attachmentMime?: string | null;
}

const AGENT_LABELS: Record<string, string> = {
  CEO: "CEO",
  CTO: "CTO",
  CMO: "CMO",
  CPO: "CPO",
  CFO: "CFO",
  CDO: "CDO",
  DEV: "DEV",
  CCO: "CCO",
};

export function ChatMessage({
  role,
  content,
  agentRole,
  isStreaming,
  attachmentName,
  attachmentMime,
}: Props) {
  if (role === "user") {
    const isPdf = attachmentMime === "application/pdf";
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-1.5 max-w-[85%] md:max-w-[75%]">
          {attachmentName && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-(--surface) border border-(--border-strong) text-xs font-mono text-(--text-muted)">
              {isPdf ? (
                <FileText className="w-3.5 h-3.5 text-(--accent-glow) shrink-0" />
              ) : (
                <Image className="w-3.5 h-3.5 text-(--accent-warm) shrink-0" aria-hidden />
              )}
              <span className="truncate max-w-45">{attachmentName}</span>
            </div>
          )}
          <div className="px-4 py-3 rounded-3xl bg-(--surface-elevated) text-(--text-primary) text-[15px] leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex flex-col gap-2">
      {/* Agent label */}
      {agentRole && (
        <div className="flex items-center gap-2 ml-1">
          <div className="w-1.5 h-1.5 rounded-full bg-(--accent-glow)" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-(--text-secondary) uppercase">
            {AGENT_LABELS[agentRole] ?? agentRole}
          </span>
        </div>
      )}

      <div className="text-(--text-primary) text-[15px] leading-relaxed">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-(--text-primary) mb-3 last:mb-0 leading-relaxed">
                  {children}
                </p>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-(--text-primary) mt-5 mb-2 tracking-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold text-(--text-primary) mt-4 mb-2">
                  {children}
                </h3>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-(--text-primary)">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-(--text-secondary)">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="my-2 space-y-1 pl-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="my-2 space-y-1 pl-1 list-decimal list-inside">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-(--text-primary) leading-relaxed pl-2 marker:text-(--accent-glow)">
                  {children}
                </li>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded-md bg-(--surface-elevated) text-(--accent-warm) font-mono text-[13px] border border-(--border)">
                  {children}
                </code>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--accent-glow) underline underline-offset-2 hover:text-(--accent-warm) transition-colors"
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {isStreaming && (
          <span
            className="inline-block w-2 h-4 ml-1 bg-(--accent-glow) animate-pulse rounded-sm"
            aria-label="streaming"
          />
        )}
      </div>
    </div>
  );
}