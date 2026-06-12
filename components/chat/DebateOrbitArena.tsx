"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AGENTS } from "@/lib/agents";
import type { DebateAgentRole } from "@/lib/types/debate";

interface DebateOrbitArenaProps {
  participants: DebateAgentRole[];
  activeAgent: DebateAgentRole | null;
  phase: "selecting" | "threading" | "deciding" | "revealing" | "done";
}

const ARENA_SIZE = 220;
const CX = ARENA_SIZE / 2;
const CY = ARENA_SIZE / 2;
const ORBIT_R = 76;

function getAgentColor(id: string): string {
  return AGENTS.find((a) => a.id === id.toLowerCase())?.color ?? "#A78BFA";
}

export function DebateOrbitArena({ participants, activeAgent, phase }: DebateOrbitArenaProps) {
  const reduced = useReducedMotion() ?? false;

  const nodes = participants.map((agent, i) => {
    const angle = (i / participants.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: agent,
      color: getAgentColor(agent),
      x: CX + Math.cos(angle) * ORBIT_R,
      y: CY + Math.sin(angle) * ORBIT_R,
    };
  });

  const phaseColors: Record<typeof phase, string> = {
    selecting: "#A78BFA",
    threading: "#06B6D4",
    deciding: "#FBBF24",
    revealing: "#10B981",
    done: "#8B5CF6",
  };
  const centerColor = phaseColors[phase];

  return (
    <div className="flex justify-center my-4">
      <div
        className="relative"
        style={{ width: ARENA_SIZE, height: ARENA_SIZE }}
        aria-hidden
      >
        {/* SVG: orbit ring + lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${ARENA_SIZE} ${ARENA_SIZE}`}
          fill="none"
        >
          {/* Rotating dashed orbit ring */}
          <motion.circle
            cx={CX} cy={CY} r={ORBIT_R}
            stroke="rgba(139,92,246,0.20)"
            strokeWidth={1}
            strokeDasharray="5 8"
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          {/* Connection lines to center */}
          {nodes.map((node) => (
            <motion.line
              key={`line-${node.id}`}
              x1={CX} y1={CY}
              x2={node.x} y2={node.y}
              stroke={node.color}
              strokeWidth={0.6}
              animate={{ strokeOpacity: node.id === activeAgent ? 0.7 : 0.18 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </svg>

        {/* Center CEO indicator */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            left: CX,
            top: CY,
            transform: "translate(-50%, -50%)",
            width: 40,
            height: 40,
            background: `${centerColor}15`,
            border: `1px solid ${centerColor}50`,
          }}
          animate={reduced ? {} : { boxShadow: [`0 0 10px ${centerColor}25`, `0 0 22px ${centerColor}50`, `0 0 10px ${centerColor}25`] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        >
          <span className="text-[9px] font-bold font-mono tracking-wider" style={{ color: centerColor }}>
            CEO
          </span>
        </motion.div>

        {/* Agent nodes */}
        {nodes.map((node, i) => {
          const isActive = node.id === activeAgent;
          return (
            <motion.div
              key={node.id}
              className="absolute rounded-xl flex items-center justify-center text-[10px] font-bold font-mono tracking-wider"
              style={{
                left: node.x,
                top: node.y,
                transform: "translate(-50%, -50%)",
                width: 34,
                height: 34,
                background: `${node.color}12`,
                border: `1px solid ${node.color}${isActive ? "60" : "30"}`,
                color: node.color,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: isActive ? 1.15 : 1,
                boxShadow: isActive
                  ? [`0 0 12px ${node.color}40`, `0 0 28px ${node.color}70`, `0 0 12px ${node.color}40`]
                  : `0 0 8px ${node.color}20`,
              }}
              transition={{
                opacity: { duration: 0.4, delay: i * 0.06 },
                scale: { duration: 0.3 },
                boxShadow: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
              }}
            >
              {node.id}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
