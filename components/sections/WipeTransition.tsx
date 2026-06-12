"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Filmic diagonal wipe between two full-bleed "worlds". As you scroll through
 * it, a panel of `to` colour sweeps diagonally across the `from` colour.
 */
export function WipeTransition({
  from,
  to,
  height = "120vh",
}: {
  from: string;
  to: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const edge = useTransform(scrollYProgress, [0.12, 0.88], [115, -20]);
  const clipPath = useTransform(edge, (v) => `polygon(0% ${v}%, 100% ${v - 22}%, 100% 100%, 0% 100%)`);

  if (reduced) return <div style={{ background: to }} />;

  return (
    <div ref={ref} className="relative" style={{ height, background: from }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ background: to, clipPath }} aria-hidden />
      </div>
    </div>
  );
}
