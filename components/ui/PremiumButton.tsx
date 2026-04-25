"use client";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

export function PremiumButton({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: PremiumButtonProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22 });
  const sy = useSpring(y, { stiffness: 260, damping: 22 });

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.22);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const sizeCls = {
    sm: "px-5 py-2 text-xs gap-1.5",
    md: "px-8 py-4 text-sm md:text-base gap-2",
    lg: "px-10 py-5 text-base md:text-lg gap-2.5",
  }[size];

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: reduced ? 0 : sx, y: reduced ? 0 : sy }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "relative overflow-hidden rounded-full font-semibold inline-flex items-center justify-center",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
        "cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-[box-shadow,border-color,background-color] duration-500",
        sizeCls,
        variant === "primary" && [
          "bg-[var(--accent-primary)] text-white",
          "shadow-[0_0_28px_rgba(139,92,246,0.42)]",
          "hover:shadow-[0_0_64px_rgba(139,92,246,0.78)]",
        ],
        variant === "secondary" && [
          "bg-transparent text-[var(--text-primary)]",
          "border border-[var(--border-strong)]",
          "hover:border-[var(--accent-glow)] hover:bg-[var(--surface)]/40",
          "hover:shadow-[0_0_22px_rgba(139,92,246,0.22)]",
        ],
        className,
      )}
    >
      {/* Shimmer sweep — primary only */}
      {variant === "primary" && !reduced && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-110%" }}
          whileHover={{ x: "110%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.20) 50%, transparent 100%)",
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-[inherit]">
        {children}
        {icon}
      </span>
    </motion.button>
  );
}
