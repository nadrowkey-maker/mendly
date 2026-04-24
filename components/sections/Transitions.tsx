"use client";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

function useP(ref: React.RefObject<HTMLDivElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return scrollYProgress;
}

/* ════════════════════════════════════════════════════════════════════════════
   TRANSITION 1 · CRYSTAL IRIS   Problem → Promise
   A prismatic mandala iris blooms open — rotating rings, conic gradient,
   20 spokes, dilating pupil, and a violet-white flash at peak
════════════════════════════════════════════════════════════════════════════ */

function IrisRing({ p, size, appear, color, thick, rotDir, rotDeg }: {
  p: MotionValue<number>; size: number; appear: number; color: string;
  thick: number; rotDir: 1 | -1; rotDeg: number;
}) {
  const scale   = useTransform(p, [appear, appear + 0.18], [0.04, 1]);
  const opacity = useTransform(p, [appear, appear + 0.12, 0.82, 1], [0, 1, 0.8, 0]);
  const rotate  = useTransform(p, [0, 1], [0, rotDir * rotDeg]);
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: "50%", top: "50%", x: "-50%", y: "-50%",
        border: `${thick}px solid ${color}`,
        boxShadow: `0 0 ${thick * 14}px ${color}, inset 0 0 ${thick * 8}px ${color}`,
        scale, opacity, rotate,
      }}
    />
  );
}

function IrisSpoke({ p, angle, appear, length, color }: {
  p: MotionValue<number>; angle: number; appear: number; length: number; color: string;
}) {
  const scaleX  = useTransform(p, [appear, appear + 0.14], [0, 1]);
  const opacity = useTransform(p, [appear, appear + 0.1, 0.82, 1], [0, 0.85, 0.55, 0]);
  return (
    <motion.div className="absolute pointer-events-none" style={{
      width: length, height: 1,
      left: "50%", top: "50%",
      background: `linear-gradient(to right, ${color}, transparent)`,
      rotate: angle, transformOrigin: "0% 50%", scaleX, opacity,
    }} />
  );
}

function IrisMandala({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0, 0.08, 0.82, 1], [0, 0.95, 0.95, 0]);
  const opacity = useTransform(p, [0, 0.06, 0.82, 1], [0, 0.42, 0.42, 0]);
  const rotate  = useTransform(p, [0, 1], [0, 250]);
  return (
    <motion.div className="absolute pointer-events-none rounded-full" style={{
      width: 860, height: 860,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "conic-gradient(from 0deg, rgba(139,92,246,0.9), rgba(6,182,212,0.7), rgba(240,171,252,0.9), rgba(167,139,250,0.7), rgba(6,182,212,0.9), rgba(139,92,246,0.6), rgba(139,92,246,0.9))",
      filter: "blur(3px)", scale, opacity, rotate,
    }} />
  );
}

function IrisPupil({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0.04, 0.42, 0.82, 1], [0, 1.6, 1.6, 0]);
  const opacity = useTransform(p, [0.04, 0.14, 0.82, 1], [0, 1, 1, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 220, height: 220,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "radial-gradient(circle, black 0%, rgba(14,10,30,0.97) 55%, transparent 100%)",
      boxShadow: "0 0 100px rgba(139,92,246,0.65), 0 0 200px rgba(139,92,246,0.3)",
      scale, opacity,
    }} />
  );
}

function IrisFlash({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.38, 0.48, 0.68, 0.85], [0, 0.92, 0.35, 0]);
  const scale   = useTransform(p, [0.38, 0.50], [0.3, 3.2]);
  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{
      background: "radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(167,139,250,0.85) 12%, rgba(139,92,246,0.45) 38%, transparent 62%)",
      opacity, scale, transformOrigin: "center center",
    }} />
  );
}

const IRIS_RINGS_CFG = [
  { size: 65,   appear: 0.02, color: "rgba(167,139,250,1)",   thick: 3.5, rotDir: 1  as const, rotDeg: 280 },
  { size: 145,  appear: 0.05, color: "rgba(139,92,246,0.95)", thick: 2.5, rotDir: -1 as const, rotDeg: 190 },
  { size: 255,  appear: 0.08, color: "rgba(6,182,212,0.9)",   thick: 2,   rotDir: 1  as const, rotDeg: 140 },
  { size: 385,  appear: 0.11, color: "rgba(240,171,252,0.8)", thick: 2,   rotDir: -1 as const, rotDeg: 95  },
  { size: 535,  appear: 0.14, color: "rgba(139,92,246,0.65)", thick: 1.5, rotDir: 1  as const, rotDeg: 65  },
  { size: 705,  appear: 0.17, color: "rgba(6,182,212,0.5)",   thick: 1.5, rotDir: -1 as const, rotDeg: 42  },
  { size: 895,  appear: 0.20, color: "rgba(167,139,250,0.38)",thick: 1,   rotDir: 1  as const, rotDeg: 28  },
  { size: 1110, appear: 0.23, color: "rgba(240,171,252,0.26)",thick: 1,   rotDir: -1 as const, rotDeg: 16  },
] as const;

const IRIS_SPOKES_CFG = Array.from({ length: 20 }, (_, i) => ({
  angle:  i * 18,
  appear: 0.05 + (i % 5) * 0.016,
  length: i % 2 === 0 ? 720 : 520,
  color:  i % 4 === 0 ? "rgba(167,139,250,0.85)"
        : i % 4 === 1 ? "rgba(6,182,212,0.75)"
        : i % 4 === 2 ? "rgba(240,171,252,0.7)"
        : "rgba(139,92,246,0.65)",
}));

export function TransitionCrystalRings() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useP(ref);

  if (reduced) return <div style={{ height: 2, background: "var(--bg-secondary)" }} />;

  return (
    <div ref={ref} style={{ height: "150vh", background: "var(--bg-secondary)" }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#05030E]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(139,92,246,0.18)_0%,transparent_70%)]" />
        <IrisMandala p={p} />
        {IRIS_RINGS_CFG.map((cfg, i) => <IrisRing key={i} p={p} {...cfg} />)}
        {IRIS_SPOKES_CFG.map((cfg, i) => <IrisSpoke key={i} p={p} {...cfg} />)}
        <IrisPupil p={p} />
        <IrisFlash p={p} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRANSITION 2 · HYPERSPACE TUNNEL   HowItWorks → Team
   20 rings surge from the void and rush past at lightspeed — you're entering
   deep space. White-violet rings accelerate inward with trailing star streaks.
════════════════════════════════════════════════════════════════════════════ */

function TunnelRing({ p, delay, color, thick }: {
  p: MotionValue<number>; delay: number; color: string; thick: number;
}) {
  const scale   = useTransform(p, [delay, delay + 0.22], [0.02, 2.2]);
  const opacity = useTransform(p, [delay, delay + 0.05, delay + 0.18, delay + 0.22], [0, 1, 0.85, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 580, height: 580,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      border: `${thick}px solid ${color}`,
      boxShadow: `0 0 ${thick * 16}px ${color}`,
      scale, opacity,
    }} />
  );
}

function SpeedLine({ p, angle, delay }: {
  p: MotionValue<number>; angle: number; delay: number;
}) {
  const scaleX  = useTransform(p, [delay, delay + 0.18], [0, 1]);
  const opacity = useTransform(p, [delay, delay + 0.06, delay + 0.15, delay + 0.2], [0, 0.7, 0.5, 0]);
  return (
    <motion.div className="absolute pointer-events-none" style={{
      width: 700, height: 1,
      left: "50%", top: "50%",
      background: "linear-gradient(to right, rgba(255,255,255,0.85), transparent)",
      rotate: angle, transformOrigin: "0% 50%", scaleX, opacity,
    }} />
  );
}

function HyperCore({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0, 0.25, 0.72, 1], [0, 1, 2.2, 0]);
  const opacity = useTransform(p, [0, 0.08, 0.72, 1], [0, 1, 0.9, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 180, height: 180,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(167,139,250,0.8) 25%, rgba(6,182,212,0.45) 55%, transparent 78%)",
      filter: "blur(6px)", scale, opacity,
    }} />
  );
}

function HyperFlash({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.55, 0.65, 0.82, 0.92], [0, 0.85, 0.6, 0]);
  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{
      background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(167,139,250,0.6) 30%, transparent 65%)",
      opacity,
    }} />
  );
}

const TUNNEL_RINGS_CFG = Array.from({ length: 20 }, (_, i) => ({
  delay: i * 0.038,
  thick: i % 3 === 0 ? 2 : 1,
  color: i % 4 === 0 ? "rgba(255,255,255,0.9)"
       : i % 4 === 1 ? "rgba(167,139,250,0.75)"
       : i % 4 === 2 ? "rgba(6,182,212,0.6)"
       : "rgba(240,171,252,0.5)",
}));

const SPEED_LINES_CFG = Array.from({ length: 16 }, (_, i) => ({
  angle: i * 22.5,
  delay: 0.04 + (i % 4) * 0.03,
}));

export function TransitionStellarGate() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useP(ref);

  if (reduced) return <div style={{ height: 2, background: "var(--bg-primary)" }} />;

  return (
    <div ref={ref} style={{ height: "150vh", background: "var(--bg-primary)" }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <HyperCore p={p} />
        {TUNNEL_RINGS_CFG.map((cfg, i) => <TunnelRing key={i} p={p} {...cfg} />)}
        {SPEED_LINES_CFG.map((cfg, i) => <SpeedLine key={i} p={p} {...cfg} />)}
        <HyperFlash p={p} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRANSITION 3 · CYBER SCAN   Action → Deliverables
   A full-screen data scan pulses across the viewport — tight horizontal grid,
   two sweeping neon beams, vertical data columns, and a terminal flash
════════════════════════════════════════════════════════════════════════════ */

function ScanLine({ p, yPct, delay }: {
  p: MotionValue<number>; yPct: number; delay: number;
}) {
  const opacity = useTransform(
    p,
    [delay, delay + 0.1, Math.min(delay + 0.55, 0.88), 0.94],
    [0, 0.5, 0.32, 0],
  );
  return (
    <motion.div className="absolute left-0 right-0 h-px pointer-events-none" style={{
      top: `${yPct}%`, opacity,
      background: "linear-gradient(to right, transparent, rgba(6,182,212,0.6) 20%, rgba(167,139,250,0.8) 50%, rgba(6,182,212,0.6) 80%, transparent)",
    }} />
  );
}

function DataColumn({ p, leftPct, delay }: {
  p: MotionValue<number>; leftPct: number; delay: number;
}) {
  const scaleY  = useTransform(p, [delay, delay + 0.25], [0, 1]);
  const opacity = useTransform(p, [delay, delay + 0.08, 0.82, 1], [0, 0.45, 0.3, 0]);
  return (
    <motion.div className="absolute top-0 bottom-0 w-px pointer-events-none" style={{
      left: `${leftPct}%`,
      background: "linear-gradient(to bottom, transparent, rgba(6,182,212,0.5) 20%, rgba(139,92,246,0.6) 50%, rgba(6,182,212,0.5) 80%, transparent)",
      transformOrigin: "top center", scaleY, opacity,
    }} />
  );
}

function SweepBeam({ p, startPct, endPct, delay, color, width }: {
  p: MotionValue<number>; startPct: number; endPct: number;
  delay: number; color: string; width: number;
}) {
  const x       = useTransform(p, [delay, Math.min(delay + 0.7, 0.96)], [`${startPct}vw`, `${endPct}vw`]);
  const opacity = useTransform(p, [delay, delay + 0.08, Math.min(delay + 0.62, 0.9), Math.min(delay + 0.72, 0.96)], [0, 1, 1, 0]);
  return (
    <motion.div className="absolute top-0 bottom-0 pointer-events-none" style={{
      width, left: 0, x, opacity,
      background: color,
      filter: "blur(6px)",
    }} />
  );
}

function ScanFlash({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.76, 0.84, 0.92], [0, 0.7, 0]);
  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{
      background: "linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(139,92,246,0.35) 50%, rgba(6,182,212,0.25) 100%)",
      opacity,
    }} />
  );
}

const SCAN_LINES_CFG = Array.from({ length: 22 }, (_, i) => ({
  yPct:  4 + i * 4.5,
  delay: 0.04 + i * 0.018,
}));

const DATA_COLUMNS_CFG = Array.from({ length: 12 }, (_, i) => ({
  leftPct: 6 + i * 8,
  delay:   0.06 + (i % 4) * 0.04,
}));

export function TransitionLightSweep() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useP(ref);

  if (reduced) return <div style={{ height: 2, background: "var(--bg-secondary)" }} />;

  return (
    <div ref={ref} style={{ height: "150vh", background: "var(--bg-secondary)" }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#05030E]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
        {DATA_COLUMNS_CFG.map((cfg, i) => <DataColumn key={i} p={p} {...cfg} />)}
        {SCAN_LINES_CFG.map((cfg, i) => <ScanLine key={i} p={p} {...cfg} />)}
        {/* Primary violet beam */}
        <SweepBeam p={p} startPct={-30} endPct={115} delay={0.08} width={260}
          color="linear-gradient(to right, transparent, rgba(139,92,246,0.28) 18%, rgba(167,139,250,0.72) 50%, rgba(139,92,246,0.28) 82%, transparent)" />
        {/* Crisp center line */}
        <SweepBeam p={p} startPct={-2} endPct={102} delay={0.08} width={1}
          color="linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)" />
        {/* Trailing cyan beam */}
        <SweepBeam p={p} startPct={-25} endPct={110} delay={0.14} width={180}
          color="linear-gradient(to right, transparent, rgba(6,182,212,0.38) 50%, transparent)" />
        <ScanFlash p={p} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRANSITION 4 · EVENT HORIZON   Comparison → Pricing
   A gravitational singularity forms — nebula cloud → glowing accretion disk →
   expanding warp rings → the void swallows everything → final flash
════════════════════════════════════════════════════════════════════════════ */

function NebulaCloud({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0, 0.12, 0.72, 1], [0, 1.2, 1.8, 0]);
  const opacity = useTransform(p, [0, 0.08, 0.68, 0.88], [0, 0.55, 0.55, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 700, height: 700,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.1) 45%, rgba(6,182,212,0.08) 65%, transparent 80%)",
      filter: "blur(40px)", scale, opacity,
    }} />
  );
}

function AccretionDisk({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0.06, 0.55], [0.04, 4.5]);
  const opacity = useTransform(p, [0.06, 0.22, 0.62, 0.85], [0, 0.85, 0.85, 0]);
  const rotate  = useTransform(p, [0, 1], [0, 60]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 360, height: 360,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "radial-gradient(circle, black 38%, rgba(255,255,255,0.95) 43%, rgba(167,139,250,1) 48%, rgba(139,92,246,0.65) 57%, rgba(80,40,160,0.25) 70%, transparent 84%)",
      scale, opacity, rotate,
    }} />
  );
}

function WarpRing({ p, delay, size, color }: {
  p: MotionValue<number>; delay: number; size: number; color: string;
}) {
  const scale   = useTransform(p, [delay, delay + 0.3], [0.04, 2.8]);
  const opacity = useTransform(p, [delay, delay + 0.08, delay + 0.24, delay + 0.32], [0, 0.9, 0.75, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: size, height: size,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      border: `1px solid ${color}`,
      boxShadow: `0 0 30px ${color}`,
      scale, opacity,
    }} />
  );
}

function SingularityFlash({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.72, 0.80, 0.92], [0, 0.8, 0]);
  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{
      background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(167,139,250,0.5) 25%, transparent 55%)",
      opacity,
    }} />
  );
}

export function TransitionEventHorizon() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useP(ref);

  if (reduced) return <div style={{ height: 2, background: "var(--bg-secondary)" }} />;

  return (
    <div ref={ref} style={{ height: "150vh", background: "var(--bg-secondary)" }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <NebulaCloud p={p} />
        <WarpRing p={p} delay={0.10} size={500} color="rgba(240,171,252,0.4)" />
        <WarpRing p={p} delay={0.18} size={500} color="rgba(167,139,250,0.5)" />
        <WarpRing p={p} delay={0.28} size={500} color="rgba(6,182,212,0.35)" />
        <AccretionDisk p={p} />
        <SingularityFlash p={p} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRANSITION 5 · SUPERNOVA   Pricing → Trust
   A compressed singularity detonates — shockwave rings blast outward,
   38 particles scatter to the edges, 16 radial rays fill the screen,
   and a color burst fades from white to violet to darkness
════════════════════════════════════════════════════════════════════════════ */

function ShockRing({ p, delay, color, thick }: {
  p: MotionValue<number>; delay: number; color: string; thick: number;
}) {
  const scale   = useTransform(p, [delay, delay + 0.35], [0, 2.8]);
  const opacity = useTransform(p, [delay, delay + 0.05, delay + 0.28, delay + 0.38], [0, 1, 0.7, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 500, height: 500,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      border: `${thick}px solid ${color}`,
      boxShadow: `0 0 ${thick * 18}px ${color}`,
      scale, opacity,
    }} />
  );
}

function NovaRay({ p, angle, delay, length, color }: {
  p: MotionValue<number>; angle: number; delay: number; length: number; color: string;
}) {
  const scaleX  = useTransform(p, [delay, delay + 0.28], [0, 1]);
  const opacity = useTransform(p, [delay, delay + 0.07, delay + 0.24, delay + 0.35], [0, 0.9, 0.7, 0]);
  return (
    <motion.div className="absolute pointer-events-none" style={{
      width: length, height: 2,
      left: "50%", top: "50%",
      background: `linear-gradient(to right, ${color}, transparent)`,
      rotate: angle, transformOrigin: "0% 50%", scaleX, opacity,
    }} />
  );
}

function NovaStar({ p, endX, endY, delay, size }: {
  p: MotionValue<number>; endX: number; endY: number; delay: number; size: number;
}) {
  const left    = useTransform(p, [delay, delay + 0.55], ["50%", `${endX}%`]);
  const top     = useTransform(p, [delay, delay + 0.55], ["50%", `${endY}%`]);
  const opacity = useTransform(p, [delay, delay + 0.06, delay + 0.48, delay + 0.58], [0, 1, 1, 0]);
  return (
    <motion.div className="absolute rounded-full bg-white pointer-events-none" style={{
      width: size, height: size,
      left, top,
      translateX: "-50%", translateY: "-50%",
      boxShadow: `0 0 ${size * 3}px white`,
      opacity,
    }} />
  );
}

function NovaCentral({ p }: { p: MotionValue<number> }) {
  const scale   = useTransform(p, [0, 0.10, 0.18, 0.78, 1], [0, 0.6, 2.5, 2.5, 0]);
  const opacity = useTransform(p, [0, 0.06, 0.16, 0.72, 0.88], [0, 1, 0.85, 0.7, 0]);
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={{
      width: 120, height: 120,
      left: "50%", top: "50%", x: "-50%", y: "-50%",
      background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(240,171,252,0.9) 30%, rgba(139,92,246,0.5) 60%, transparent 80%)",
      filter: "blur(8px)", scale, opacity,
    }} />
  );
}

const SHOCK_RINGS_CFG = [
  { delay: 0.05, color: "rgba(255,255,255,0.95)",  thick: 3 },
  { delay: 0.10, color: "rgba(240,171,252,0.85)",  thick: 2 },
  { delay: 0.16, color: "rgba(167,139,250,0.75)",  thick: 2 },
  { delay: 0.23, color: "rgba(139,92,246,0.65)",   thick: 1.5 },
  { delay: 0.31, color: "rgba(6,182,212,0.55)",    thick: 1.5 },
  { delay: 0.40, color: "rgba(139,92,246,0.4)",    thick: 1 },
  { delay: 0.50, color: "rgba(167,139,250,0.3)",   thick: 1 },
  { delay: 0.60, color: "rgba(240,171,252,0.2)",   thick: 1 },
] as const;

const NOVA_RAYS_CFG = Array.from({ length: 16 }, (_, i) => ({
  angle:  i * 22.5,
  delay:  0.08 + (i % 4) * 0.02,
  length: 700 + (i % 3) * 150,
  color:  i % 2 === 0 ? "rgba(240,171,252,0.88)" : "rgba(139,92,246,0.78)",
}));

const NOVA_STARS_CFG = Array.from({ length: 38 }, (_, i) => {
  const angle = (i * 360) / 38;
  const dist  = 28 + ((i * 13) % 42);
  const cx    = 50 + Math.cos((angle * Math.PI) / 180) * dist;
  const cy    = 50 + Math.sin((angle * Math.PI) / 180) * dist;
  return {
    endX:  Math.max(3, Math.min(97, cx)),
    endY:  Math.max(3, Math.min(97, cy)),
    delay: 0.06 + ((i * 7) % 20) * 0.013,
    size:  1 + (i % 3),
  };
});

export function TransitionCosmicIgnite() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useP(ref);

  if (reduced) return <div style={{ height: 2, background: "var(--bg-primary)" }} />;

  return (
    <div ref={ref} style={{ height: "150vh", background: "var(--bg-primary)" }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        {NOVA_STARS_CFG.map((cfg, i) => <NovaStar key={i} p={p} {...cfg} />)}
        {NOVA_RAYS_CFG.map((cfg, i) => <NovaRay key={i} p={p} {...cfg} />)}
        {SHOCK_RINGS_CFG.map((cfg, i) => <ShockRing key={i} p={p} {...cfg} />)}
        <NovaCentral p={p} />
      </div>
    </div>
  );
}
