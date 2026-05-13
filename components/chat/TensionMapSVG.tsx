"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { DebateAgentRole, TensionLink } from "@/lib/types/debate";

const AGENT_COLORS: Record<string, string> = {
  CEO: "#BF5AF2",
  CTO: "#0A84FF",
  CMO: "#FF375F",
  CFO: "#FF9F0A",
  CPO: "#30D158",
  CDO: "#06B6D4",
  DEV: "#30D158",
  CCO: "#F472B6",
};

const INTENSITY_COLORS: Record<1 | 2 | 3, string> = {
  1: "#FF9F0A",
  2: "#FF6B35",
  3: "#FF375F",
};

const SVG_SIZE = 260;
const CENTER = SVG_SIZE / 2;
const NODE_ORBIT = 90;
const NODE_R = 18;

interface Props {
  agents: DebateAgentRole[];
  links: TensionLink[];
}

function getPositions(agents: string[]): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  const n = agents.length;
  agents.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    out[a] = {
      x: CENTER + NODE_ORBIT * Math.cos(angle),
      y: CENTER + NODE_ORBIT * Math.sin(angle),
    };
  });
  return out;
}

function bezier(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cpx = mx + (CENTER - mx) * 0.45;
  const cpy = my + (CENTER - my) * 0.45;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function TensionMapSVG({ agents, links }: Props) {
  const t = useTranslations("chat");
  const positions = getPositions(agents);
  const hasGlow = links.some((l) => l.intensity === 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-white/[0.06] p-4 mt-2"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <p className="text-[9px] font-mono tracking-[0.25em] text-[#6E6E73] uppercase mb-1">
        {t("tensionMapTitle")}
      </p>
      <p className="text-[10px] text-[#6E6E73] mb-3">{t("tensionMapSub")}</p>

      <div className="flex justify-center">
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{ maxWidth: SVG_SIZE, overflow: "visible" }}
        >
          {hasGlow && (
            <defs>
              <filter id="tension-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* Tension curves */}
          {links.map((link, i) => {
            const a = positions[link.a];
            const b = positions[link.b];
            if (!a || !b) return null;
            const color = INTENSITY_COLORS[link.intensity];
            const d = bezier(a.x, a.y, b.x, b.y);
            const strokeW = link.intensity === 3 ? 2 : link.intensity === 2 ? 1.5 : 1;
            const opacity = link.intensity === 3 ? 0.9 : link.intensity === 2 ? 0.65 : 0.4;
            return (
              <motion.path
                key={`${link.a}-${link.b}`}
                d={d}
                stroke={color}
                strokeWidth={strokeW}
                fill="none"
                strokeDasharray={link.intensity === 1 ? "4 3" : undefined}
                filter={link.intensity === 3 ? "url(#tension-glow)" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity }}
                transition={{ duration: 1.3, delay: 0.5 + i * 0.2, ease: "easeOut" }}
              />
            );
          })}

          {/* Agent nodes */}
          {agents.map((agent, i) => {
            const pos = positions[agent];
            if (!pos) return null;
            const color = AGENT_COLORS[agent] ?? "#888";
            return (
              <motion.g
                key={agent}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_R}
                  fill={`${color}14`}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={7.5}
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {agent}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
