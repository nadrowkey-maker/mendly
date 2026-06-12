"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Check } from "lucide-react";

function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last + "…").width > maxWidth) {
      lines[maxLines - 1] = last.slice(0, -1).trim() + "…";
    } else {
      lines[maxLines - 1] = last + "…";
    }
  }
  return lines;
}

async function renderVerdictImage(question: string, verdict: string): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  ctx.fillStyle = "#0a0a0c";
  ctx.fillRect(0, 0, W, H);

  // Aurora glows
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(180, 120, 620, "rgba(0,113,227,0.22)");
  glow(950, 220, 640, "rgba(91,157,255,0.16)");
  glow(700, 1280, 560, "rgba(52,216,180,0.10)");

  const pad = 96;
  let y = 150;

  // Wordmark
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px Geist, system-ui, sans-serif";
  ctx.fillText("MENDLY", pad, y);

  // Label
  y += 70;
  ctx.fillStyle = "#0071e3";
  ctx.font = "600 26px Geist, system-ui, sans-serif";
  ctx.fillText("CEO DECISION", pad, y);

  // Question
  y += 64;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 36px Geist, system-ui, sans-serif";
  const qLines = wrap(ctx, `“${stripMarkdown(question)}”`, W - pad * 2, 2);
  for (const l of qLines) {
    ctx.fillText(l, pad, y);
    y += 50;
  }

  // Verdict
  y += 44;
  ctx.fillStyle = "#f7f7f8";
  ctx.font = "600 52px Geist, system-ui, sans-serif";
  const vLines = wrap(ctx, stripMarkdown(verdict), W - pad * 2, 9);
  for (const l of vLines) {
    ctx.fillText(l, pad, y);
    y += 70;
  }

  // Footer line
  const fy = H - 130;
  const grad = ctx.createLinearGradient(pad, 0, W - pad, 0);
  grad.addColorStop(0, "#0071e3");
  grad.addColorStop(0.5, "#5b9dff");
  grad.addColorStop(1, "#34d8b4");
  ctx.fillStyle = grad;
  ctx.fillRect(pad, fy, W - pad * 2, 3);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 26px Geist, system-ui, sans-serif";
  ctx.fillText("Decided with my AI team · mendly", pad, fy + 50);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export function ShareVerdictButton({ question, verdict }: { question: string; verdict: string }) {
  const t = useTranslations("chat");
  const [done, setDone] = useState(false);

  const handle = async () => {
    const blob = await renderVerdictImage(question, verdict);
    if (!blob) return;
    const file = new File([blob], "mendly-verdict.png", { type: "image/png" });

    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Mendly" } as ShareData);
        return;
      } catch {
        /* fall through to download */
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mendly-verdict.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--border-strong) bg-(--surface-1) text-[11px] text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-2) transition-all cursor-pointer"
    >
      {done ? <Check className="w-3.5 h-3.5 text-(--aurora-teal)" /> : <Share2 className="w-3.5 h-3.5" />}
      {t("shareVerdict")}
    </button>
  );
}
