"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserPlus, Lock, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ShareVerdictButton } from "./ShareVerdictButton";
import type {
  AgentSelection,
  DebateMessage,
  DebateState,
  ConsensusVote,
  VoteVerdict,
} from "@/lib/types/debate";

/*
 * Une seule teinte pour tous les spécialistes.
 *
 * Chaque rôle avait sa couleur — rose, ambre, turquoise… Huit pastilles de
 * huit couleurs reconstituaient visuellement le produit à huit agents, et
 * l'ambre attribué au CFO détournait la seule teinte réservée à la
 * contradiction interne. Ce qui distingue un spécialiste, c'est son nom et ce
 * qu'il dit.
 */
const SPECIALIST_TONE = "#9aa4ae";
const AGENT_COLORS: Record<string, string> = {
  CEO: SPECIALIST_TONE,
  CTO: SPECIALIST_TONE,
  CMO: SPECIALIST_TONE,
  CFO: SPECIALIST_TONE,
  CPO: SPECIALIST_TONE,
  CDO: SPECIALIST_TONE,
  DEV: SPECIALIST_TONE,
  CCO: SPECIALIST_TONE,
};

const VIOLET = "#0071e3";

interface Props {
  state: DebateState;
  onAbort: () => void;
}

// Turnaround detection (Bloc 2.3) — flags a message where an agent genuinely
// shifts position. Heuristic on the explicit phrasing the prompts ask for.
const TURN_PHRASES = [
  "convinced me", "changed my mind", "change my mind", "you're right, let", "you are right, let",
  "i concede", "i'll concede", "point taken", "i was wrong", "ok, but then", "okay, but then", "fair, let",
  "m'as convaincu", "m'avez convaincu", "change d'avis", "changé d'avis", "t'as raison, on",
  "tu as raison, on", "je concède", "j'avais tort", "ok, mais alors", "admettons", "soit, on",
];
function detectTurnaround(content: string): boolean {
  const c = content.toLowerCase();
  return TURN_PHRASES.some((p) => c.includes(p));
}

// ─── Selection header ───────────────────────────────────────────────────────

function SelectionCard({ selection, onAbort }: { selection: AgentSelection; onAbort: () => void }) {
  const t = useTranslations("chat");
  const names = selection.agents.join(" · ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-(--border) bg-(--surface-1) mb-4"
    >
      <span className="text-[12px] text-(--text-muted) truncate">
        <span className="text-(--text-secondary) font-medium">{names}</span>
      </span>
      <button
        onClick={onAbort}
        className="text-[11px] text-(--text-dim) hover:text-(--danger) transition-colors cursor-pointer shrink-0"
      >
        {t("abortDebate")}
      </button>
    </motion.div>
  );
}

// ─── Surprise join banner ───────────────────────────────────────────────────

function SurpriseJoinBanner({ agent }: { agent: string }) {
  const t = useTranslations("chat");
  const color = AGENT_COLORS[agent] ?? SPECIALIST_TONE;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border mb-1"
      style={{ borderColor: `${color}33`, background: `${color}0d` }}
    >
      <UserPlus className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-[11px] font-mono font-semibold" style={{ color }}>{agent}</span>
      <span className="text-[11px] text-(--text-dim)">{t("surpriseJoinLabel")}</span>
      <div className="h-px flex-1" style={{ background: `${color}22` }} />
    </motion.div>
  );
}

// ─── Turn bubble ────────────────────────────────────────────────────────────

function TurnBubble({ message, index }: { message: DebateMessage; index: number }) {
  const t = useTranslations("chat");
  const color = AGENT_COLORS[message.agent] ?? SPECIALIST_TONE;
  const turned = !message.isStreaming && detectTurnaround(message.content);

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
        <div className="relative shrink-0 mt-0.5">
          {turned && <span className="aurora-ring" />}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-bold border"
            style={{ color, background: `${color}1a`, borderColor: `${color}40` }}
          >
            {message.agent}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold mb-1 flex items-center flex-wrap gap-2" style={{ color }}>
            {message.agent}
            {message.isStreaming && (
              <span className="text-[10px] font-normal text-(--text-dim) uppercase tracking-wider">● live</span>
            )}
            {turned && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                style={{ background: "rgba(0,113,227,0.16)", color: VIOLET, border: "1px solid rgba(0,113,227,0.4)" }}
              >
                <RefreshCw className="w-2.5 h-2.5" />
                {t("changedMind")}
              </span>
            )}
          </span>

          <div className="text-[14px] leading-relaxed prose prose-invert max-w-none text-(--text-secondary) prose-p:text-(--text-secondary) prose-strong:text-(--text-primary) prose-li:text-(--text-secondary)">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-1">{children}</ul>,
                li: ({ children }) => <li className="pl-2 leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-(--text-primary)">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-(--text-muted) animate-pulse rounded-sm" />
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
                style={{ background: `${color}0d`, borderLeft: `2px solid ${color}33` }}
              >
                <Lock className="w-3 h-3 shrink-0 mt-0.5" style={{ color, opacity: 0.5 }} />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color, opacity: 0.6 }}>
                    {t("whisperLabel")}
                  </p>
                  <p className="text-[12px] italic leading-snug" style={{ color: `${color}cc` }}>
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

// ─── CEO decision card ──────────────────────────────────────────────────────

function CeoCallCard({
  content,
  isStreaming,
  question,
}: {
  content: string;
  isStreaming: boolean;
  question: string;
}) {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[24px] border p-5 mt-2"
      style={{
        borderColor: "rgba(0,113,227,0.4)",
        background: "linear-gradient(135deg, rgba(0,113,227,0.12), rgba(91,157,255,0.07))",
      }}
    >
      <div className="aurora-bar absolute top-0 left-0 right-0" />
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 border"
          style={{ color: VIOLET, background: `${VIOLET}1a`, borderColor: `${VIOLET}40` }}
        >
          CEO
        </div>
        <p className="text-[10px] font-mono tracking-[0.18em] uppercase" style={{ color: VIOLET }}>
          {t("synthesisTitle")}
        </p>
        {isStreaming ? (
          <span className="ml-auto text-[10px] font-mono uppercase tracking-wider animate-pulse" style={{ color: VIOLET }}>
            ● live
          </span>
        ) : (
          <div className="ml-auto">
            <ShareVerdictButton question={question} verdict={content} />
          </div>
        )}
      </div>

      <div className="text-[14px] leading-relaxed prose prose-invert max-w-none text-(--text-secondary) prose-p:text-(--text-secondary) prose-strong:text-(--text-primary) prose-li:text-(--text-secondary)">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-1">{children}</ul>,
            li: ({ children }) => <li className="pl-2 leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-(--text-primary)">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse rounded-sm" style={{ background: VIOLET }} />
        )}
      </div>
    </motion.div>
  );
}

// ─── Consensus panel ────────────────────────────────────────────────────────

const VERDICT_ICON: Record<VoteVerdict, string> = { agree: "✓", reluctant: "~", disagree: "✗" };
const VERDICT_COLOR: Record<VoteVerdict, string> = {
  agree: "#34d8b4",
  reluctant: "#fbbf24",
  disagree: "#f472b6",
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
      className="rounded-2xl border border-(--border) p-4 mt-2 bg-(--surface-1)"
    >
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[9px] font-mono tracking-[0.25em] text-(--text-muted) uppercase">
          {t("consensusTitle")}
        </p>
        <div className="flex items-center gap-1.5 ml-auto">
          {agreeCnt > 0 && <span className="text-[10px] font-mono" style={{ color: "#34d8b4" }}>{agreeCnt}✓</span>}
          {reluctantCnt > 0 && <span className="text-[10px] font-mono" style={{ color: "#fbbf24" }}>{reluctantCnt}~</span>}
          {disagreeCnt > 0 && <span className="text-[10px] font-mono" style={{ color: "#f472b6" }}>{disagreeCnt}✗</span>}
        </div>
      </div>

      <div className="space-y-2.5">
        {votes.map((v, i) => {
          const agentColor = AGENT_COLORS[v.agent] ?? SPECIALIST_TONE;
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
                style={{ color: agentColor, background: `${agentColor}1a`, borderColor: `${agentColor}38` }}
              >
                {v.agent.slice(0, 3)}
              </div>
              <span className="text-[11px] font-mono font-bold shrink-0 mt-0.5 w-4 text-center" style={{ color: vColor }}>
                {icon}
              </span>
              <span className="text-[12px] text-(--text-secondary) italic leading-snug">
                {v.note || t(`vote${v.verdict.charAt(0).toUpperCase()}${v.verdict.slice(1)}` as "voteAgree")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Deciding placeholder ("The CEO is thinking…", Bloc 1.6) ─────────────────

function DecidingPlaceholder() {
  const t = useTranslations("chat");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-(--surface-1)"
      style={{ borderColor: "rgba(0,113,227,0.22)" }}
    >
      <div className="relative w-7 h-7 shrink-0">
        <span className="aurora-ring" />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-bold border"
          style={{ color: VIOLET, background: `${VIOLET}1a`, borderColor: `${VIOLET}40` }}
        >
          CEO
        </div>
      </div>
      <p className="text-sm text-(--text-muted)">{t("ceoSynthesizing")}</p>
    </motion.div>
  );
}

// ─── Main view ──────────────────────────────────────────────────────────────

export function DebateView({ state, onAbort }: Props) {
  const t = useTranslations("chat");

  if (state.phase === "idle") return null;

  if (state.phase === "selecting") {
    return (
      <div className="my-4 flex items-center gap-3 py-3 px-2 text-(--text-muted)">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: VIOLET }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.15s]" style={{ background: VIOLET }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.3s]" style={{ background: VIOLET }} />
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
          <div className="h-px flex-1" style={{ background: "rgba(0,113,227,0.18)" }} />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: VIOLET }}>
            {t("synthesisLabel")}
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(0,113,227,0.18)" }} />
        </div>
      )}

      {state.phase === "deciding" && !ceoCall && <DecidingPlaceholder />}

      {ceoCall !== null && (
        <CeoCallCard
          content={ceoCall}
          isStreaming={state.phase === "deciding"}
          question={stateAny.question}
        />
      )}

      {/* Consensus votes */}
      {consensus !== null && consensus.length > 0 && <ConsensusPanel votes={consensus} />}

      {state.phase === "aborted" && (
        <div className="px-4 py-3 rounded-2xl border border-(--border) bg-(--surface-1) text-(--text-muted) text-sm italic">
          {t("debateAborted")}
        </div>
      )}
    </div>
  );
}
