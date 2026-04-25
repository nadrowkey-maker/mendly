"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function TransitionPortal() {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const rawGlow = useMotionValue(0);
  // Slow spring so glow lingers briefly after each scroll burst
  const glow = useSpring(rawGlow, { stiffness: 22, damping: 7 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || reduced) return;

    let lastY = window.scrollY;
    let decayId: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      // 30px of scroll = full intensity; anything more is clamped
      rawGlow.set(Math.min(delta / 30, 1));
      clearTimeout(decayId);
      decayId = setTimeout(() => rawGlow.set(0), 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(decayId);
    };
  }, [mounted, reduced, rawGlow]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none"
      style={{ opacity: glow }}
    >
      {/* Outer violet-to-cyan radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(139,92,246,0.14)_0%,rgba(6,182,212,0.06)_45%,transparent_70%)]" />
      {/* Inner fuchsia core */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_22%_22%_at_50%_50%,rgba(240,171,252,0.09)_0%,transparent_60%)]" />
    </motion.div>,
    document.body
  );
}
