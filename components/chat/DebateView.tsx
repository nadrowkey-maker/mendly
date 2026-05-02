"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { AgentSelection, DebateMessage, DebateState } from "@/lib/types/debate";

interface Props {
  state: DebateState;
  onAbort: () => void;
}

function SelectionCard({
  selection,
  onAbort,
}: {
  selection: AgentSelection;
  onAbort: () => void;
}) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-(--accent-glow)/30 bg-(--accent-glow)/5 p-4 my-2"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-(--accent-glow) animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-(--accent-glow) uppercase">
            {t("debateInProgress")}
          </span>
        </div>
        <button
          onClick={onAbort}
          className="text-xs text-(--text-muted) hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          ⏹ {t("abortDebate")}
        </button>
      </div>
      <p className="text-[10px] font-mono tracking-widest text-(--text-dim) uppercase mb-1.5">
        {t("ceoBringsIn")}
      </p>
      <p className="text-base font-bold text-(--text-primary) mb-1">
        {selection.agents.join(" · ")}
      </p>
      <p className="text-sm text-(--text-secondary) italic">"{selection.rationale}"</p>
    </motion.div>
  );
}

function AgentCard({ message }: { message: DebateMessage }) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-(--border-strong) bg-(--surface) p-4"
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-(--border)">
        <div
          className={[
            "w-2 h-2 rounded-full shrink-0",
            message.isStreaming ? "bg-(--accent-glow) animate-pulse" : "bg-(--text-dim)",
          ].join(" ")}
        />
        <span className="text-[10px] font-mono font-bold tracking-widest text-(--text-dim) uppercase">
          {t("round")} {message.round}
        </span>
        <span className="text-xs font-mono font-bold text-(--text-primary)">
          · {message.agent}
        </span>
        {message.isStreaming && (
          <span className="ml-auto text-[10px] font-mono text-(--accent-glow) uppercase tracking-wider">
            ● {t("liveLabel")}
          </span>
        )}
      </div>

      <div className="text-[14px] text-(--text-primary) leading-relaxed prose prose-invert max-w-none prose-p:text-(--text-primary) prose-strong:text-(--text-primary) prose-li:text-(--text-primary)">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-2 space-y-1 pl-1">{children}</ul>,
            li: ({ children }) => (
              <li className="text-(--text-primary) leading-relaxed pl-2 marker:text-(--accent-glow)">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-(--text-primary)">{children}</strong>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-(--accent-glow) animate-pulse rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

function SynthesisCard({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-(--accent-primary)/40 p-6 mt-2 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(91,33,182,0.05) 100%)",
      }}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-(--accent-primary)/20">
        <div className="w-9 h-9 rounded-xl bg-(--accent-primary) flex items-center justify-center text-white text-sm font-bold font-mono shrink-0">
          CEO
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-(--accent-warm) uppercase">
            {t("synthesisLabel")}
          </p>
          <p className="text-sm font-bold text-(--text-primary)">{t("synthesisTitle")}</p>
        </div>
        {isStreaming && (
          <span className="ml-auto text-[10px] font-mono text-(--accent-warm) uppercase tracking-wider">
            ● {t("liveLabel")}
          </span>
        )}
      </div>

      <div className="text-[15px] text-(--text-primary) leading-relaxed prose prose-invert max-w-none prose-p:text-(--text-primary) prose-strong:text-(--text-primary) prose-li:text-(--text-primary)">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-3 space-y-1.5 pl-1">{children}</ul>,
            li: ({ children }) => (
              <li className="text-(--text-primary) leading-relaxed pl-2 marker:text-(--accent-warm)">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-(--text-primary)">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-(--accent-warm) animate-pulse rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

function SynthesizingPlaceholder() {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-(--accent-primary)/30 bg-(--accent-primary)/5 p-6 mt-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-(--accent-primary)/50 flex items-center justify-center text-white text-sm font-bold animate-pulse">
          CEO
        </div>
        <div>
          <p className="text-sm font-bold text-(--text-primary)">{t("ceoSynthesizing")}</p>
          <p className="text-xs text-(--text-muted)">{t("ceoSynthesizingSub")}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function DebateView({ state, onAbort }: Props) {
  const t = useTranslations("chat");

  if (state.phase === "idle") return null;

  if (state.phase === "selecting") {
    return (
      <div className="my-4 flex items-center gap-3 py-4 px-2 text-(--text-muted)">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-glow) animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-glow) animate-bounce [animation-delay:0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-glow) animate-bounce [animation-delay:0.3s]" />
        </div>
        <span className="text-sm font-medium">{t("ceoSelecting")}</span>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="my-4 px-4 py-3 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
        {state.message}
      </div>
    );
  }

  const stateAny = state as Extract<
    DebateState,
    { phase: "round1" | "round2" | "synthesizing" | "done" | "aborted" }
  >;
  const selection = "selection" in stateAny ? stateAny.selection : null;
  const messages = "messages" in stateAny ? (stateAny.messages as DebateMessage[]) : [];
  const synthesis = "synthesis" in stateAny ? (stateAny.synthesis as string | null) : null;

  const round1 = messages.filter((m) => m.round === 1);
  const round2 = messages.filter((m) => m.round === 2);

  return (
    <div className="space-y-3">
      {selection && <SelectionCard selection={selection} onAbort={onAbort} />}

      {round1.length > 0 && (
        <div className="space-y-3">
          {round1.map((m) => (
            <AgentCard key={m.id} message={m} />
          ))}
        </div>
      )}

      {round2.length > 0 && (
        <div className="space-y-3">
          {round2.map((m) => (
            <AgentCard key={m.id} message={m} />
          ))}
        </div>
      )}

      {state.phase === "synthesizing" && !synthesis && <SynthesizingPlaceholder />}

      {synthesis !== null && (
        <SynthesisCard
          content={synthesis}
          isStreaming={state.phase === "synthesizing"}
        />
      )}

      {state.phase === "aborted" && (
        <div className="px-4 py-3 rounded-2xl border border-(--border-strong) bg-(--surface)/40 text-(--text-muted) text-sm italic">
          {t("debateAborted")}
        </div>
      )}
    </div>
  );
}
