"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { AgentId } from "@/lib/agents";

const AGENT_GRADIENTS: Record<AgentId, [string, string]> = {
  ceo: ["#0071e3", "#4a9eff"],
  cto: ["#06B6D4", "#22D3EE"],
  cmo: ["#F0ABFC", "#E879F9"],
  cpo: ["#34D399", "#10B981"],
  cdo: ["#22D3EE", "#06B6D4"],
  cfo: ["#FBBF24", "#F59E0B"],
  dev: ["#10B981", "#34D399"],
  cco: ["#F472B6", "#EC4899"],
};

interface AgentOrbProps {
  agentId: AgentId;
  size?: number;
}

export function AgentOrb({ agentId, size = 72 }: AgentOrbProps) {
  const reduced = useReducedMotion() ?? false;
  const [color1, color2] = AGENT_GRADIENTS[agentId];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-hidden>
      {/* Outer pulse ring */}
      <motion.div
        className="absolute rounded-full"
        animate={
          reduced
            ? {}
            : { scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }
        }
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color1}40 0%, transparent 70%)`,
        }}
      />

      {/* Mid ring */}
      <motion.div
        className="absolute rounded-full"
        animate={reduced ? {} : { scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
        transition={{ duration: 2.4, delay: 0.4, ease: "easeInOut", repeat: Infinity }}
        style={{
          width: size * 0.82,
          height: size * 0.82,
          background: `radial-gradient(circle, ${color2}30 0%, transparent 70%)`,
        }}
      />

      {/* Core orb */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          background: `radial-gradient(135deg, ${color1}CC, ${color2}99)`,
          boxShadow: `0 0 ${size * 0.4}px ${color1}50, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        <span
          className="font-bold font-mono tracking-wider text-white/95"
          style={{ fontSize: size * 0.18 }}
        >
          {agentId.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
