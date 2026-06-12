"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Cinematic scroll-linked reveal — a "camera focus", not a slide.
 * Content materializes by zooming in + un-blurring as it enters; with `exit`
 * it pushes toward the viewer and dissolves as it leaves (a fly-through feel).
 * No bottom-to-top sliding.
 */
export function ScrollReveal({
  children,
  className = "",
  exit = false,
}: {
  children: ReactNode;
  className?: string;
  exit?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.08"],
  });

  const stops = [0, 0.22, 0.8, 1];
  const opacity = useTransform(scrollYProgress, stops, [0, 1, 1, exit ? 0 : 1]);
  const scale = useTransform(scrollYProgress, stops, [0.88, 1, 1, exit ? 1.12 : 1]);
  const blurN = useTransform(scrollYProgress, stops, [18, 0, 0, exit ? 14 : 0]);
  const filter = useTransform(blurN, (b) => `blur(${b}px)`);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, filter, willChange: "transform, opacity, filter" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
