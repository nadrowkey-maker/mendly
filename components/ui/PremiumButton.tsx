"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseClasses =
  "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-primary) focus-visible:ring-(--accent-glow)";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-white text-black hover:bg-(--text-primary) shadow-[0_1px_2px_0_rgba(0,0,0,0.4)] hover:shadow-[0_4px_16px_0_rgba(255,255,255,0.15)] hover:-translate-y-px",
  secondary:
    "bg-(--surface) text-(--text-primary) border border-(--border-strong) hover:border-(--border-emphasis) hover:bg-(--surface-elevated)",
  ghost:
    "bg-transparent text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface)/60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-4 text-xs rounded-full gap-1.5",
  md: "h-10 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-7 text-base rounded-full gap-2.5",
};

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";