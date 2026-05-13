"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { AgentSelection, DebateMessage, DebateState } from "@/lib/types/debate";

const AGENT_COLORS: Record<string, string> = {
  CEO: "#BF5AF2",
  CTO: "#0A84FF",
  CMO: "#FF375F",
  CFO: "#FF9F0A",
  CPO: "#30D158",
  CDO: "#06B6D4",
  DEV: "#30D158",
  CCO: "#F472B6",
};

interface Props {
  state: DebateState;
  onAbort: () => void;
}

function SelectionCard({ selection, onAbort }: { selection: AgentSelection; onAbort: () => void }) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-4 py-3 rounded-2xl border border-[rgba(191,90,242,0.20)] bg-[rgba(191,90,242,0.05)] mb-4"
    >
      <div className="flex items-center gap-2.5">
        <Zap className="w-3.5 h-3.5 text-[#BF5AF2] animate-pulse shrink-0" />
        <div className="flex items-center gap-1.5">
          {selection.agents.map((a) => (
            <span
              key={a}
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ color: AGENT_COLORS[a] ?? "#fff", background: `${AGENT_COLORS[a] ?? "#fff"}18` }}
            >
              {a}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-[#6E6E73] italic hidden sm:block">"{selection.rationale}"</span>
      </div>
      <button
        onClick={onAbort}
        className="text-[11px] text-[#6E6E73] hover:text-red-400 transition-colors cursor-pointer shrink-0 ml-3"
      >
        {t("abortDebate")}
      </button>
    </motion.div>
  );
}

function TurnBubble({ message, index }: { message: DebateMessage; index: number }) {
  const color = AGENT_COLORS[message.agent] ?? "#fff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="flex gap-3 items-start group"
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0 mt-0.5 border"
        style={{
          color,
          background: `${color}16`,
          borderColor: `${color}35`,
        }}
      >
        {message.agent}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold mb-1 block" style={{ color }}>
          {message.agent}
          {message.isStreaming && (
            <span className="ml-2 text-[10px] font-normal text-[#6E6E73] uppercase tracking-wider">● live</span>
          )}
        </span>
        <div className="text-[14px] text-[#A1A1A6] leading-relaxed prose prose-invert max-w-none prose-p:text-[#A1A1A6] prose-strong:text-white prose-li:text-[#A1A1A6]">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-1">{children}</ul>,
              li: ({ children }) => <li className="pl-2 leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#6E6E73] animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CeoCallCard({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[rgba(191,90,242,0.28)] p-5 mt-2"
      style={{ background: "rgba(191,90,242,0.06)" }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 border"
          style={{ color: "#BF5AF2", background: "#BF5AF216", borderColor: "#BF5AF235" }}
        >
          CEO
        </div>
        <div>
          <p className="text-[10px] font-mono tracking-[0.18em] text-[#BF5AF2] uppercase">
            {t("synthesisTitle")}
          </p>
        </div>
        {isStreaming && (
          <span className="ml-auto text-[10px] font-mono text-[#BF5AF2] uppercase tracking-wider animate-pulse">
            ● live
          </span>
        )}
      </div>

      <div className="text-[14px] text-[#A1A1A6] leading-relaxed prose prose-invert max-w-none prose-p:text-[#A1A1A6] prose-strong:text-white prose-li:text-[#A1A1A6]">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-1">{children}</ul>,
            li: ({ children }) => (
              <li className="pl-2 leading-relaxed marker:text-[#BF5AF2]">{children}</li>
            ),
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#BF5AF2] animate-pulse rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

function DecidingPlaceholder() {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[rgba(191,90,242,0.18)] bg-[rgba(191,90,242,0.04)]"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0 border animate-pulse"
        style={{ color: "#BF5AF2", background: "#BF5AF216", borderColor: "#BF5AF235" }}
      >
        CEO
      </div>
      <p className="text-sm text-[#6E6E73]">{t("ceoSynthesizing")}</p>
    </motion.div>
  );
}

export function DebateView({ state, onAbort }: Props) {
  const t = useTranslations("chat");

  if (state.phase === "idle") return null;

  if (state.phase === "selecting") {
    return (
      <div className="my-4 flex items-center gap-3 py-3 px-2 text-[#6E6E73]">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2] animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2] animate-bounce [animation-delay:0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2] animate-bounce [animation-delay:0.3s]" />
        </div>
        <span className="text-sm">{t("ceoSelecting")}</span>
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
    { phase: "threading" | "deciding" | "done" | "aborted" }
  >;
  const selection = "selection" in stateAny ? stateAny.selection : null;
  const messages = "messages" in stateAny ? (stateAny.messages as DebateMessage[]) : [];
  const ceoCall = "ceoCall" in stateAny ? (stateAny.ceoCall as string | null) : null;

  return (
    <div className="space-y-4">
      {selection && <SelectionCard selection={selection} onAbort={onAbort} />}

      {/* Thread of agent turns */}
      {messages.length > 0 && (
        <div className="space-y-5 pl-1">
          {messages.map((m, i) => (
            <TurnBubble key={m.id} message={m} index={i} />
          ))}
        </div>
      )}

      {/* Separator before CEO */}
      {(state.phase === "deciding" || ceoCall !== null) && (
        <div className="flex items-center gap-3 my-2">
          <div className="h-px flex-1 bg-[rgba(191,90,242,0.15)]" />
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#BF5AF2] uppercase">
            {t("synthesisLabel")}
          </span>
          <div className="h-px flex-1 bg-[rgba(191,90,242,0.15)]" />
        </div>
      )}

      {state.phase === "deciding" && !ceoCall && <DecidingPlaceholder />}

      {ceoCall !== null && (
        <CeoCallCard content={ceoCall} isStreaming={state.phase === "deciding"} />
      )}

      {state.phase === "aborted" && (
        <div className="px-4 py-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#6E6E73] text-sm italic">
          {t("debateAborted")}
        </div>
      )}
    </div>
  );
}
