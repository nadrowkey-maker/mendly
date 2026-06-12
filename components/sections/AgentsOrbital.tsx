"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AGENTS } from "@/lib/agents";

const ORBIT_R = 200;
const SIZE = 520;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function AgentsOrbital() {
  const reduced = useReducedMotion() ?? false;

  const nodes = AGENTS.map((agent, i) => {
    const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...agent,
      x: CX + Math.cos(angle) * ORBIT_R,
      y: CY + Math.sin(angle) * ORBIT_R,
    };
  });

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: SIZE, height: SIZE, maxWidth: "min(100%, 520px)" }}
      aria-hidden
    >
      {/* SVG: rings + connection lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
      >
        {/* Dashed orbit ring */}
        <circle
          cx={CX} cy={CY} r={ORBIT_R}
          stroke="rgba(139,92,246,0.18)"
          strokeWidth={1}
          strokeDasharray="6 10"
        />
        {/* Inner glow ring */}
        <circle cx={CX} cy={CY} r={52} stroke="rgba(139,92,246,0.20)" strokeWidth={1} />

        {/* Connection lines: center → each node */}
        {nodes.map((node) => (
          <line
            key={`line-${node.id}`}
            x1={CX} y1={CY}
            x2={node.x} y2={node.y}
            stroke={node.color}
            strokeWidth={0.6}
            strokeOpacity={0.22}
          />
        ))}
      </svg>

      {/* Center: Mendly core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
        viewport={{ once: true }}
        className="absolute"
        style={{
          left: CX,
          top: CY,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={reduced ? {} : { scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
          style={{
            width: 104,
            height: 104,
            top: -8,
            left: -8,
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center"
          style={{
            background: "rgba(139,92,246,0.10)",
            border: "1.5px solid rgba(139,92,246,0.45)",
            boxShadow: "0 0 40px rgba(139,92,246,0.18)",
          }}
        >
          <span className="text-[9px] font-bold tracking-[0.28em] text-white/90 uppercase">
            Mendly
          </span>
        </div>
      </motion.div>

      {/* Agent nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.07, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
          className="absolute flex flex-col items-center gap-1.5"
          style={{
            left: node.x,
            top: node.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            animate={reduced ? {} : { boxShadow: [`0 0 12px ${node.color}20`, `0 0 28px ${node.color}45`, `0 0 12px ${node.color}20`] }}
            transition={{ duration: 2.5 + i * 0.3, ease: "easeInOut", repeat: Infinity }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-bold font-mono tracking-wider"
            style={{
              background: `${node.color}12`,
              border: `1px solid ${node.color}35`,
              color: node.color,
            }}
          >
            {node.id.toUpperCase()}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
