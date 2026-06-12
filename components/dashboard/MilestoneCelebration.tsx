"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const COLORS = ["#0071e3", "#34d399", "#fbbf24", "#ec4899", "#06b6d4", "#a78bfa", "#fb923c"];

/** Celebrates a project milestone (e.g. Idea → MVP) — Bloc 8.3. Auto-dismisses. */
export function MilestoneCelebration({
  fromLabel,
  toLabel,
  onDone,
}: {
  fromLabel: string;
  toLabel: string;
  onDone: () => void;
}) {
  const t = useTranslations("newProject");

  useEffect(() => {
    const timer = setTimeout(onDone, 3800);
    return () => clearTimeout(timer);
  }, [onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, i) => ({
        x: (Math.random() - 0.5) * 760,
        y: (Math.random() - 0.5) * 520,
        rot: Math.random() * 360,
        dur: 1.3 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDone}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 backdrop-blur-sm cursor-pointer"
    >
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        {pieces.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-sm"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 0.5 }}
            transition={{ duration: p.dur, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.85, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative glass rounded-3xl px-10 py-9 text-center max-w-sm mx-4"
        style={{ color: "#1d1d1f" }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-(--apple-accent) mb-2">
          {t("milestoneReached")}
        </p>
        <p className="text-2xl font-semibold tracking-tight">
          {fromLabel} <span className="text-(--apple-accent)">→</span> {toLabel}
        </p>
        <p className="mt-3 text-[14px] text-(--apple-text-2)">{t("milestoneCelebrate")}</p>
      </motion.div>
    </motion.div>
  );
}
