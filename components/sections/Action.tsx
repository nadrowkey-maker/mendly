"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, type CSSProperties } from "react";
import { GradientText } from "@/components/ui/gradient-text";

interface ChatMessage {
  agent: string;
  color: string;
  time: string;
  text: string;
}

const MESSAGES: ChatMessage[] = [
  { agent: "CMO", color: "#F0ABFC", time: "10:24", text: "Dropped the Q2 marketing plan. 90-day roadmap, 3 acquisition channels, €8K budget breakdown. Full deck in the workspace." },
  { agent: "CTO", color: "#06B6D4", time: "10:27", text: "Reviewed. The paid social push conflicts with feature freeze — locked until May 14th. Recommend shifting campaign start +2 weeks." },
  { agent: "CMO", color: "#F0ABFC", time: "10:29", text: "Revised: campaign kicks off May 15th post-launch. Does that clear your sprint?" },
  { agent: "CTO", color: "#06B6D4", time: "10:31", text: "Confirmed. I'll flag if the timeline shifts." },
  { agent: "CEO", color: "#8B5CF6", time: "10:33", text: "Decision logged. Revised timeline locked. OKRs updated. See you at Friday's sprint review." },
];

const ONLINE_AGENTS = [
  { id: "CEO", color: "#8B5CF6" },
  { id: "CTO", color: "#06B6D4" },
  { id: "CMO", color: "#F0ABFC" },
  { id: "CPO", color: "#A78BFA" },
  { id: "CFO", color: "#FBBF24" },
];

function MessageBubble({
  msg,
  index,
  reduced,
}: {
  msg: ChatMessage;
  index: number;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 14, x: reduced ? 0 : -6 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.5, delay: reduced ? 0 : index * 0.22, ease: [0.25, 1, 0.5, 1] }}
      viewport={{ once: true, margin: "-40px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex gap-3 items-start group/msg rounded-xl px-2 py-2 -mx-2 transition-colors duration-200 hover:bg-(--surface-elevated)/60 cursor-default"
    >
      {/* Avatar */}
      <motion.div
        animate={{
          boxShadow: hovered ? `0 0 18px ${msg.color}55` : "none",
          scale: hovered ? 1.08 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 bg-[var(--c-bg)] text-[var(--c)] border border-[var(--c-b)]"
        style={{ "--c": msg.color, "--c-bg": `${msg.color}1A`, "--c-b": `${msg.color}40` } as CSSProperties}
      >
        {msg.agent[0]}
      </motion.div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-white">{msg.agent}</span>
          <span className="text-[10px] text-(--text-dim)">{msg.time}</span>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[9px] font-mono text-(--accent-glow) ml-auto"
            >
              Reply →
            </motion.span>
          )}
        </div>
        <p className="text-sm text-(--text-muted) group-hover/msg:text-(--text-primary) leading-relaxed transition-colors duration-200">
          {msg.text}
        </p>
      </div>
    </motion.div>
  );
}

export function ActionSection() {
  const t = useTranslations("action");
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-(--bg-primary)">
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--bg-secondary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-secondary) to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(6,182,212,0.10)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-6">{t("eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
            {t("title")}{" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
          <p className="text-lg text-(--text-muted) max-w-xl mx-auto">{t("sub")}</p>
        </motion.div>

        {/* Chat mockup — gradient border wrapper */}
        <motion.div
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="relative rounded-3xl p-[1px] bg-gradient-to-br from-(--accent-primary)/40 via-(--border) to-(--accent-hot)/25 shadow-[0_0_80px_rgba(6,182,212,0.12)]"
        >
          <div className="rounded-[22px] bg-(--surface)/80 backdrop-blur-xl overflow-hidden">

            {/* Window chrome */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-(--border) bg-(--surface)/60">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-(--surface-elevated)" />
                <span className="w-2.5 h-2.5 rounded-full bg-(--surface-elevated)" />
                <span className="w-2.5 h-2.5 rounded-full bg-(--surface-elevated)" />
              </div>
              <span className="text-xs text-(--text-dim) font-mono">Sprint Review — Friday</span>

              {/* Online agents */}
              <div className="flex items-center gap-1 ml-auto">
                {ONLINE_AGENTS.map((a) => (
                  <div
                    key={a.id}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold border"
                    style={{
                      color: a.color,
                      background: `${a.color}1A`,
                      borderColor: `${a.color}40`,
                    }}
                  >
                    {a.id[0]}
                  </div>
                ))}
                <span className="ml-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 flex flex-col gap-1">
              {MESSAGES.map((msg, i) => (
                <MessageBubble key={i} msg={msg} index={i} reduced={reduced} />
              ))}

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: reduced ? 1 : 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 1.4, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 pt-2 pl-2"
              >
                <div className="ceo-glow-pulse w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 bg-[#8B5CF61A] text-[#8B5CF6] border border-[#8B5CF640]">
                  C
                </div>
                <span className="text-xs text-(--text-dim)">CEO</span>
                <span className="text-[10px] text-(--text-dim) italic">is typing</span>
                <div className="flex gap-1 ml-0.5">
                  <span className="typing-dot-1 w-1.5 h-1.5 rounded-full bg-(--text-dim) block" />
                  <span className="typing-dot-2 w-1.5 h-1.5 rounded-full bg-(--text-dim) block" />
                  <span className="typing-dot-3 w-1.5 h-1.5 rounded-full bg-(--text-dim) block" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Captions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 flex-wrap">
          {([t("caption1"), t("caption2"), t("caption3")] as const).map((caption, i) => (
            <motion.p
              key={i}
              initial={{ opacity: reduced ? 1 : 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.3 + i * 0.1 }}
              viewport={{ once: true }}
              className="text-xs text-(--text-dim) flex items-center gap-1.5"
            >
              <span className="text-(--accent-hot)">→</span>
              {caption}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
