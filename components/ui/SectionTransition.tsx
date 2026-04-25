"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
}

export function SectionTransition({ children, className }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Entry (0 → 0.3): zoom in from large + fade in + blur clears
  // Active (0.3 → 0.7): fully visible, no transforms
  // Exit (0.7 → 1): zoom out + fade + blur
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1.12, 1, 1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.45]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -40]);
  const filter = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    ["blur(10px)", "blur(0px)", "blur(0px)", "blur(6px)"]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        reduced
          ? undefined
          : { scale, opacity, y, filter, willChange: "transform, opacity, filter" }
      }
    >
      {children}
    </motion.div>
  );
}
