"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Zap, AlertCircle } from "lucide-react";
import { fetchUserUsage } from "@/lib/actions/usage";

interface UsageBadgeProps {
  initialUsed: number;
  initialLimit: number;
  refreshKey?: number; // bump this to force a refetch (e.g. after sending a message)
}

export function UsageBadge({ initialUsed, initialLimit, refreshKey = 0 }: UsageBadgeProps) {
  const t = useTranslations("rateLimit");
  const [used, setUsed] = useState(initialUsed);
  const [limit, setLimit] = useState(initialLimit);

  // Refetch usage when refreshKey changes
  useEffect(() => {
    if (refreshKey === 0) return;
    let mounted = true;
    fetchUserUsage().then((res) => {
      if (!mounted || !res) return;
      setUsed(res.used);
      setLimit(res.limit);
    });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const remaining = Math.max(0, limit - used);
  const ratio = used / limit;

  // Color states
  let color = "var(--accent-glow)"; // healthy violet
  let bg = "var(--surface)";
  let border = "var(--border)";

  if (ratio >= 1) {
    color = "#F87171"; // red
    bg = "rgba(248,113,113,0.08)";
    border = "rgba(248,113,113,0.4)";
  } else if (ratio >= 0.7) {
    color = "#FBBF24"; // yellow
    bg = "rgba(251,191,36,0.08)";
    border = "rgba(251,191,36,0.3)";
  }

  if (remaining === 0) {
    return (
      <Link
        href="/upgrade"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all hover:scale-105"
        style={{
          color,
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        {t("limitReachedShort")}
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider"
      style={{
        color,
        background: bg,
        border: `1px solid ${border}`,
      }}
      title={t("tooltip", { used, limit })}
    >
      <Zap className="w-3 h-3" />
      <span className="font-bold">
        {remaining}/{limit}
      </span>
      <span className="opacity-70 hidden md:inline">{t("messagesShort")}</span>
    </motion.div>
  );
}