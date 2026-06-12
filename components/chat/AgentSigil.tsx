import type { ReactNode } from "react";
import type { AgentId } from "@/lib/agents";

interface AgentSigilProps {
  agentId: AgentId;
  color: string;
  size?: number;
  className?: string;
}

const SIGIL_PATHS: Record<AgentId, (s: number) => ReactNode> = {
  // CEO: Diamond — authority, decision
  ceo: (s) => (
    <polygon
      points={`${s / 2},${s * 0.08} ${s * 0.92},${s / 2} ${s / 2},${s * 0.92} ${s * 0.08},${s / 2}`}
      fill="none" strokeWidth={1.2} strokeLinejoin="round"
    />
  ),
  // CTO: Circuit cross — architecture
  cto: (s) => (
    <g>
      <line x1={s / 2} y1={s * 0.1} x2={s / 2} y2={s * 0.9} strokeWidth={1.2} />
      <line x1={s * 0.1} y1={s / 2} x2={s * 0.9} y2={s / 2} strokeWidth={1.2} />
      <circle cx={s / 2} cy={s / 2} r={s * 0.12} fill="none" strokeWidth={1.2} />
      <circle cx={s / 2} cy={s * 0.1} r={s * 0.055} fill="currentColor" />
      <circle cx={s / 2} cy={s * 0.9} r={s * 0.055} fill="currentColor" />
      <circle cx={s * 0.1} cy={s / 2} r={s * 0.055} fill="currentColor" />
      <circle cx={s * 0.9} cy={s / 2} r={s * 0.055} fill="currentColor" />
    </g>
  ),
  // CMO: Wave — story, reach
  cmo: (s) => (
    <g>
      <path
        d={`M${s * 0.08},${s * 0.4} C${s * 0.25},${s * 0.2} ${s * 0.42},${s * 0.6} ${s * 0.58},${s * 0.4} S${s * 0.75},${s * 0.2} ${s * 0.92},${s * 0.4}`}
        fill="none" strokeWidth={1.2} strokeLinecap="round"
      />
      <path
        d={`M${s * 0.08},${s * 0.58} C${s * 0.25},${s * 0.38} ${s * 0.42},${s * 0.78} ${s * 0.58},${s * 0.58} S${s * 0.75},${s * 0.38} ${s * 0.92},${s * 0.58}`}
        fill="none" strokeWidth={0.8} strokeLinecap="round" strokeOpacity={0.6}
      />
    </g>
  ),
  // CPO: Nested squares — layers, scope
  cpo: (s) => (
    <g>
      <rect x={s * 0.1} y={s * 0.1} width={s * 0.8} height={s * 0.8} rx={2} fill="none" strokeWidth={1.2} />
      <rect x={s * 0.28} y={s * 0.28} width={s * 0.44} height={s * 0.44} rx={2} fill="none" strokeWidth={1} />
      <circle cx={s / 2} cy={s / 2} r={s * 0.08} fill="currentColor" />
    </g>
  ),
  // CDO: Eye / lens — data, insight
  cdo: (s) => (
    <g>
      <path
        d={`M${s * 0.1},${s / 2} Q${s / 2},${s * 0.12} ${s * 0.9},${s / 2} Q${s / 2},${s * 0.88} ${s * 0.1},${s / 2}`}
        fill="none" strokeWidth={1.2}
      />
      <circle cx={s / 2} cy={s / 2} r={s * 0.16} fill="none" strokeWidth={1.2} />
      <circle cx={s / 2} cy={s / 2} r={s * 0.06} fill="currentColor" />
    </g>
  ),
  // CFO: Balance / scale — finance
  cfo: (s) => (
    <g>
      <line x1={s / 2} y1={s * 0.12} x2={s / 2} y2={s * 0.88} strokeWidth={1.2} />
      <line x1={s * 0.15} y1={s * 0.38} x2={s * 0.85} y2={s * 0.38} strokeWidth={1.2} />
      <path d={`M${s * 0.15},${s * 0.38} L${s * 0.28},${s * 0.62} L${s * 0.02},${s * 0.62}Z`} fill="none" strokeWidth={0.9} strokeLinejoin="round" />
      <path d={`M${s * 0.85},${s * 0.38} L${s * 0.98},${s * 0.62} L${s * 0.72},${s * 0.62}Z`} fill="none" strokeWidth={0.9} strokeLinejoin="round" />
    </g>
  ),
  // DEV: Code brackets
  dev: (s) => (
    <g>
      <polyline points={`${s * 0.38},${s * 0.22} ${s * 0.18},${s / 2} ${s * 0.38},${s * 0.78}`} fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${s * 0.62},${s * 0.22} ${s * 0.82},${s / 2} ${s * 0.62},${s * 0.78}`} fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={s * 0.43} y1={s * 0.5} x2={s * 0.57} y2={s * 0.5} strokeWidth={1} strokeOpacity={0.5} />
    </g>
  ),
  // CCO: Speech bubble / broadcast
  cco: (s) => (
    <g>
      <path
        d={`M${s * 0.15},${s * 0.2} L${s * 0.85},${s * 0.2} Q${s * 0.92},${s * 0.2} ${s * 0.92},${s * 0.28} L${s * 0.92},${s * 0.62} Q${s * 0.92},${s * 0.7} ${s * 0.84},${s * 0.7} L${s * 0.45},${s * 0.7} L${s * 0.28},${s * 0.86} L${s * 0.28},${s * 0.7} L${s * 0.16},${s * 0.7} Q${s * 0.08},${s * 0.7} ${s * 0.08},${s * 0.62} L${s * 0.08},${s * 0.28} Q${s * 0.08},${s * 0.2} ${s * 0.15},${s * 0.2}`}
        fill="none" strokeWidth={1.1} strokeLinejoin="round"
      />
    </g>
  ),
};

export function AgentSigil({ agentId, color, size = 24, className = "" }: AgentSigilProps) {
  const pathFn = SIGIL_PATHS[agentId];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke={color}
      color={color}
      className={className}
      aria-hidden
    >
      {pathFn(size)}
    </svg>
  );
}
