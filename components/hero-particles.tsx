"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  [139, 92, 246],
  [167, 139, 250],
  [6, 182, 212],
  [240, 171, 252],
  [251, 191, 36],
];

const REPEL_RADIUS = 110;
const REPEL_STRENGTH = 4.2;
const DECAY = 0.86;
const CONNECT_DIST = 100;
const MAX_PULSES = 22;
const PULSE_EVERY = 22;
const POPUP_EVERY = 90; // ~1.5s at 60fps

const AGENT_MSGS = [
  { agent: "CFO", color: [251, 191, 36],  text: "Runway extended +18mo" },
  { agent: "CEO", color: [139, 92, 246],  text: "Sprint review locked →" },
  { agent: "CTO", color: [6, 182, 212],   text: "Stack frozen. 0 debt." },
  { agent: "CMO", color: [240, 171, 252], text: "GTM deck pushed" },
  { agent: "CPO", color: [167, 139, 250], text: "Roadmap v2 shipped" },
  { agent: "DEV", color: [16, 185, 129],  text: "PR #47 merged ✓" },
  { agent: "CDO", color: [34, 211, 238],  text: "Schema validated" },
  { agent: "CCO", color: [249, 115, 22],  text: "Legal: terms cleared" },
  { agent: "CEO", color: [139, 92, 246],  text: "OKRs updated" },
  { agent: "CTO", color: [6, 182, 212],   text: "Infra scaled 10K rps" },
  { agent: "CMO", color: [240, 171, 252], text: "2.1K leads · today 🔥" },
  { agent: "CFO", color: [251, 191, 36],  text: "Q2 burn: on track" },
  { agent: "CPO", color: [167, 139, 250], text: "NPS jumped to 72" },
  { agent: "CEO", color: [139, 92, 246],  text: "All hands · Fri 10am" },
  { agent: "DEV", color: [16, 185, 129],  text: "Deploy · 0 errors" },
  { agent: "CCO", color: [249, 115, 22],  text: "Risk matrix cleared" },
  { agent: "CTO", color: [6, 182, 212],   text: "Auth refactor done" },
  { agent: "CMO", color: [240, 171, 252], text: "A/B winner: +34% CTR" },
  { agent: "CFO", color: [251, 191, 36],  text: "Invoice #114 sent" },
  { agent: "CDO", color: [34, 211, 238],  text: "Pipeline: 99.8% uptime" },
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  pushX: number; pushY: number;
  radius: number;
  color: number[];
  alpha: number;
  alphaDir: number;
  alphaSpeed: number;
  glowScale: number;
}

interface Pulse {
  a: Particle; b: Particle;
  t: number; speed: number; color: number[];
}

interface Popup {
  id: number;
  xPct: number; yPct: number;
  msg: typeof AGENT_MSGS[0];
}

let _uid = 0;

function spawnParticle(w: number, h: number, fromBottom = false): Particle {
  const idx = Math.random() < 0.08 ? 4 : Math.floor(Math.random() * 4);
  return {
    x: Math.random() * w,
    y: fromBottom ? h + Math.random() * 40 : Math.random() * h,
    vx: (Math.random() - 0.5) * 0.28,
    vy: -(Math.random() * 0.45 + 0.08),
    pushX: 0, pushY: 0,
    radius: Math.random() * 1.8 + 0.4,
    color: COLORS[idx],
    alpha: Math.random() * 0.55 + 0.08,
    alphaDir: Math.random() > 0.5 ? 1 : -1,
    alphaSpeed: Math.random() * 0.003 + 0.001,
    glowScale: Math.random() * 6 + 3,
  };
}

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const mouse = { x: -9999, y: -9999, active: false };
    const COUNT = Math.min(120, Math.floor((W * H) / 8000));
    const particles: Particle[] = Array.from({ length: COUNT }, () => spawnParticle(W, H));
    const pulses: Pulse[] = [];
    let frame = 0;
    let raf: number;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // ── CONNECTIONS ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pa = particles[i], pb = particles[j];
          const dx = pa.x - pb.x, dy = pa.y - pb.y;
          const dSq = dx * dx + dy * dy;
          if (dSq > CONNECT_DIST * CONNECT_DIST) continue;

          const dist = Math.sqrt(dSq);
          const a = (1 - dist / CONNECT_DIST) * 0.38;
          const [ra, ga, ba] = pa.color;
          const [rb, gb, bb] = pb.color;

          const grd = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
          grd.addColorStop(0, `rgba(${ra},${ga},${ba},${a.toFixed(3)})`);
          grd.addColorStop(1, `rgba(${rb},${gb},${bb},${a.toFixed(3)})`);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = grd;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // ── SPAWN PULSES ──
      if (frame % PULSE_EVERY === 0 && pulses.length < MAX_PULSES) {
        for (let t = 0; t < 30; t++) {
          const i = Math.floor(Math.random() * particles.length);
          const j = Math.floor(Math.random() * particles.length);
          if (i === j) continue;
          const pa = particles[i], pb = particles[j];
          const dx = pa.x - pb.x, dy = pa.y - pb.y;
          if (dx * dx + dy * dy < CONNECT_DIST * CONNECT_DIST) {
            pulses.push({ a: pa, b: pb, t: 0, speed: Math.random() * 0.013 + 0.007, color: Math.random() > 0.5 ? pa.color : pb.color });
            break;
          }
        }
      }

      // ── PULSES ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const [r, g, b] = p.color;
        const pg = ctx.createRadialGradient(x, y, 0, x, y, 7);
        pg.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
        pg.addColorStop(0.5, `rgba(${r},${g},${b},0.3)`);
        pg.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill();
      }

      // ── PARTICLES ──
      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < REPEL_RADIUS * REPEL_RADIUS && dSq > 0) {
            const dist = Math.sqrt(dSq);
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            p.pushX += (dx / dist) * force;
            p.pushY += (dy / dist) * force;
          }
        }
        p.x += p.vx + p.pushX; p.y += p.vy + p.pushY;
        p.pushX *= DECAY; p.pushY *= DECAY;
        p.alpha += p.alphaDir * p.alphaSpeed;
        if (p.alpha > 0.72) p.alphaDir = -1;
        if (p.alpha < 0.04) p.alphaDir = 1;
        if (p.y < -12 || p.x < -20 || p.x > W + 20 || p.y > H + 20) {
          Object.assign(p, spawnParticle(W, H, true)); continue;
        }
        const [r, g, b] = p.color;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * p.glowScale);
        grd.addColorStop(0, `rgba(${r},${g},${b},${(p.alpha * 0.55).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * p.glowScale, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(p.alpha * 1.8, 1).toFixed(3)})`; ctx.fill();
      }

      // ── SPAWN POPUP ──
      if (frame % POPUP_EVERY === 0 && W > 0 && H > 0) {
        const p = particles[Math.floor(Math.random() * particles.length)];
        const msg = AGENT_MSGS[Math.floor(Math.random() * AGENT_MSGS.length)];
        const id = ++_uid;
        // clamp so popup doesn't overflow edges
        const xPct = Math.max(2, Math.min(72, (p.x / W) * 100));
        const yPct = Math.max(5, Math.min(88, (p.y / H) * 100));
        if (mounted.current) {
          setPopups(prev => [...prev.slice(-5), { id, xPct, yPct, msg }]);
          setTimeout(() => {
            if (mounted.current) setPopups(prev => prev.filter(e => e.id !== id));
          }, 2800);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };

    const section = canvas.closest("section");
    const target = section ?? window;
    target.addEventListener("mousemove", onMouseMove as EventListener);
    target.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    return () => {
      mounted.current = false;
      cancelAnimationFrame(raf);
      target.removeEventListener("mousemove", onMouseMove as EventListener);
      target.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-75"
        aria-hidden
      />
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            className="absolute pointer-events-none"
            style={{ left: `${popup.xPct}%`, top: `${popup.yPct}%` }}
            initial={{ opacity: 0, scale: 0.75, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/10 shadow-lg whitespace-nowrap">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: `rgb(${popup.msg.color.join(",")})`,
                  boxShadow: `0 0 5px rgb(${popup.msg.color.join(",")})`,
                }}
              />
              <span
                className="text-[9px] font-mono font-bold tracking-wide"
                style={{ color: `rgb(${popup.msg.color.join(",")})` }}
              >
                {popup.msg.agent}
              </span>
              <span className="text-[9px] text-white/55 font-mono">
                {popup.msg.text}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
