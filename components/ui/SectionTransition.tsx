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

  // Entry (0 → 0.2): fade in + remonte doucement
  // Active (0.2 → 0.8): fully visible
  // Exit (0.8 → 1): fade out + descend doucement
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -40]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        reduced
          ? undefined
          // ✅ OPTIMISATION MAJEURE : On a retiré le filter et le willChange: filter
          : { opacity, y, willChange: "transform, opacity" } 
      }
    >
      {children}
    </motion.div>
  );
}