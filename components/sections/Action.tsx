"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, type CSSProperties } from "react";

const ease = [0.25, 1, 0.5, 1] as const;

interface ChatMessage {
  agent: string;
  color: string;
  time: string;
  text: string;
}

const MESSAGES: ChatMessage[] = [
  { agent: "CMO", color: "#F0ABFC", time: "10:12", text: "Q2 plan is ready. Three channels: Meta ads, SEO content sprint, influencer collab. Total ask: 11K. Target: 2,000 signups by June 30." },
  { agent: "CFO", color: "#FBBF24", time: "10:15", text: "Hard no on 11K. We have 4 months of runway and zero validated CAC. Paid social without LTV data is burning cash. Come back under 4K with unit economics." },
  { agent: "CTO", color: "#06B6D4", time: "10:18", text: "Flagging: the Meta campaign lands during feature freeze May 3-14. We spike traffic and something breaks -- we can't push a fix. Terrible first impression window." },
  { agent: "CMO", color: "#F0ABFC", time: "10:22", text: "Revised. Dropping Meta entirely. Keeping influencer collab + organic SEO sprint only -- 3.2K total. Campaign moves to May 16, post-freeze. CAC tracker live from day 1." },
  { agent: "CEO", color: "#8B5CF6", time: "10:25", text: "Approved. 3.2K hard cap, start May 16. CMO owns CAC report by May 30 -- no extensions. CTO: freeze is sacred. CFO: ping me if burn deviates more than 15% from model." },
];

const ONLINE_AGENTS = [
  { id: "CEO", color: "#8B5CF6" },
  { id: "CFO", color: "#FBBF24" },
  { id: "CTO", color: "#06B6D4" },
  { id: "CMO", color: "#F0ABFC" },
  { id: "CPO", color: "#A78BFA" },
];

function MessageBubble({ msg, index, reduced }: { msg: ChatMessage; index: number; reduced: boolean }) {
  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduced ? 0 : index * 0.18, ease }}
      viewport={{ once: true, margin: "-40px" }}
      className="flex gap-3 items-start rounded-xl px-2 py-2 -mx-2 hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 cursor-default"
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-semibold shrink-0 mt-0.5 border"
        style={{
          color: msg.color,
          background: `${msg.color}14`,
          borderColor: `${msg.color}30`,
        }}
      >
        {msg.agent}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-white/90">{msg.agent}</span>
          <span className="text-[10px] text-white/35">{msg.time}</span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
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
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-[#080808]">
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[#080808] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#080808] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-white/40 uppercase mb-6">{t("eyebrow")}</p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white mb-6"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
          <p className="text-xl text-white/40 max-w-xl mx-auto leading-[1.47]">{t("sub")}</p>
        </motion.div>

        {/* Chat window */}
        <motion.div
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-60px" }}
          className="glass-card rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        >
          {/* macOS-style chrome */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[rgba(255,55,95,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[rgba(255,159,10,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-[rgba(48,209,88,0.5)]" />
            </div>
            <span className="text-xs text-white/35 font-medium">Q2 Planning &middot; Week 14</span>

            {/* Online agents */}
            <div className="flex items-center gap-1 ml-auto">
              {ONLINE_AGENTS.map((a) => (
                <div
                  key={a.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-mono font-semibold border"
                  style={{ color: a.color, background: `${a.color}14`, borderColor: `${a.color}30` }}
                >
                  {a.id.slice(0, 3)}
                </div>
              ))}
              <span className="ml-2 flex items-center gap-1 text-[10px] text-[#A78BFA] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
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
              transition={{ delay: reduced ? 0 : 1.2, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 pt-2 pl-2"
            >
              <div className="ceo-glow-pulse w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-mono font-semibold shrink-0 border"
                style={{ color: "#8B5CF6", background: "#8B5CF614", borderColor: "#8B5CF630" }}>
                CEO
              </div>
              <span className="text-[10px] text-white/35 italic">is typing</span>
              <div className="flex gap-1 ml-0.5">
                <span className="typing-dot-1 w-1 h-1 rounded-full bg-white/25 block" />
                <span className="typing-dot-2 w-1 h-1 rounded-full bg-white/25 block" />
                <span className="typing-dot-3 w-1 h-1 rounded-full bg-white/25 block" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Captions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-8 flex-wrap">
          {([t("caption1"), t("caption2"), t("caption3")] as const).map((caption, i) => (
            <motion.p
              key={i}
              initial={{ opacity: reduced ? 1 : 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.2 + i * 0.08 }}
              viewport={{ once: true }}
              className="text-xs text-white/35 flex items-center gap-1.5"
            >
              <span className="w-1 h-1 rounded-full" style={{ background: "linear-gradient(135deg,#8B5CF6,#06B6D4)", display: "inline-block" }} />
              {caption}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}

