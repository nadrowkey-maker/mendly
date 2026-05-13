"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, UserPlus, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { TensionMapSVG } from "./TensionMapSVG";
import type {
  AgentSelection,
  DebateMessage,
  DebateState,
  ConsensusVote,
  VoteVerdict,
} from "@/lib/types/debate";

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

// ─── Selection header ────────────────────────────────────────────────────────

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
          {selection.agents.map((a) => {
            const isLate = selection.lateJoins?.includes(a);
            const color = isLate ? "#FF9F0A" : (AGENT_COLORS[a] ?? "#fff");
            return (
              <span
                key={a}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{ color, background: `${color}18` }}
              >
                {isLate ? `+${a}` : a}
              </span>
            );
          })}
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

// ─── Surprise join banner ─────────────────────────────────────────────────────

function SurpriseJoinBanner({ agent }: { agent: string }) {
  const t = useTranslations("chat");
  const color = AGENT_COLORS[agent] ?? "#FF9F0A";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border mb-1"
      style={{ borderColor: `${color}30`, background: `${color}0A` }}
    >
      <UserPlus className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-[11px] font-mono font-semibold" style={{ color }}>{agent}</span>
      <span className="text-[11px] text-[#6E6E73]">{t("surpriseJoinLabel")}</span>
      <div className="h-px flex-1" style={{ background: `${color}20` }} />
    </motion.div>
  );
}

// ─── Turn bubble ──────────────────────────────────────────────────────────────

function TurnBubble({ message, index }: { message: DebateMessage; index: number }) {
  const t = useTranslations("chat");
  const color = AGENT_COLORS[message.agent] ?? "#fff";

  return (
    <div>
      {message.isLateJoin && <SurpriseJoinBanner agent={message.agent} />}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className="flex gap-3 items-start group"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0 mt-0.5 border"
          style={{ color, background: `${color}16`, borderColor: `${color}35` }}
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

          {/* Whisper */}
          {message.whisper && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-2.5 overflow-hidden"
            >
              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: `${color}08`, borderLeft: `2px solid ${color}28` }}
              >
                <Lock className="w-3 h-3 shrink-0 mt-0.5" style={{ color, opacity: 0.45 }} />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color, opacity: 0.5 }}>
                    {t("whisperLabel")}
                  </p>
                  <p className="text-[12px] italic leading-snug" style={{ color: `${color}BB` }}>
                    {message.whisper}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── CEO decision card ────────────────────────────────────────────────────────

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
            li: ({ children }) => <li className="pl-2 leading-relaxed marker:text-[#BF5AF2]">{children}</li>,
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

// ─── Consensus panel ──────────────────────────────────────────────────────────

const VERDICT_ICON: Record<VoteVerdict, string> = { agree: "✓", reluctant: "~", disagree: "✗" };
const VERDICT_COLOR: Record<VoteVerdict, string> = {
  agree: "#30D158",
  reluctant: "#FF9F0A",
  disagree: "#FF375F",
};

function ConsensusPanel({ votes }: { votes: ConsensusVote[] }) {
  const t = useTranslations("chat");
  const agreeCnt = votes.filter((v) => v.verdict === "agree").length;
  const reluctantCnt = votes.filter((v) => v.verdict === "reluctant").length;
  const disagreeCnt = votes.filter((v) => v.verdict === "disagree").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-white/6 p-4 mt-2"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[9px] font-mono tracking-[0.25em] text-[#6E6E73] uppercase">
          {t("consensusTitle")}
        </p>
        <div className="flex items-center gap-1.5 ml-auto">
          {agreeCnt > 0 && (
            <span className="text-[10px] font-mono" style={{ color: "#30D158" }}>{agreeCnt}✓</span>
          )}
          {reluctantCnt > 0 && (
            <span className="text-[10px] font-mono" style={{ color: "#FF9F0A" }}>{reluctantCnt}~</span>
          )}
          {disagreeCnt > 0 && (
            <span className="text-[10px] font-mono" style={{ color: "#FF375F" }}>{disagreeCnt}✗</span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {votes.map((v, i) => {
          const agentColor = AGENT_COLORS[v.agent] ?? "#fff";
          const icon = VERDICT_ICON[v.verdict];
          const vColor = VERDICT_COLOR[v.verdict];
          return (
            <motion.div
              key={v.agent}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09 }}
              className="flex items-start gap-2.5"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-mono font-bold shrink-0 border"
                style={{ color: agentColor, background: `${agentColor}14`, borderColor: `${agentColor}30` }}
              >
                {v.agent.slice(0, 3)}
              </div>
              <span className="text-[11px] font-mono font-bold shrink-0 mt-0.5 w-4 text-center" style={{ color: vColor }}>
                {icon}
              </span>
              <span className="text-[12px] text-[#A1A1A6] italic leading-snug">
                {v.note || t(`vote${v.verdict.charAt(0).toUpperCase()}${v.verdict.slice(1)}` as "voteAgree")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Deciding placeholder ─────────────────────────────────────────────────────

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

// ─── Main view ────────────────────────────────────────────────────────────────

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
    { phase: "threading" | "deciding" | "revealing" | "done" | "aborted" }
  >;
  const selection = "selection" in stateAny ? stateAny.selection : null;
  const messages = "messages" in stateAny ? (stateAny.messages as DebateMessage[]) : [];
  const ceoCall = "ceoCall" in stateAny ? (stateAny.ceoCall as string | null) : null;
  const consensus =
    state.phase === "revealing" || state.phase === "done" ? state.consensus : null;
  const tensionMap =
    state.phase === "revealing" || state.phase === "done" ? state.tensionMap : null;

  return (
    <div className="space-y-4">
      {selection && <SelectionCard selection={selection} onAbort={onAbort} />}

      {/* Thread */}
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

      {/* Consensus votes */}
      {consensus !== null && consensus.length > 0 && (
        <ConsensusPanel votes={consensus} />
      )}

      {/* Tension map */}
      {tensionMap !== null && tensionMap.length > 0 && selection && (
        <TensionMapSVG agents={selection.agents} links={tensionMap} />
      )}

      {state.phase === "aborted" && (
        <div className="px-4 py-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#6E6E73] text-sm italic">
          {t("debateAborted")}
        </div>
      )}
    </div>
  );
}
