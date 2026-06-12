"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseClasses =
  "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] focus-visible:ring-[rgba(167,139,250,0.6)]";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-white text-black hover:bg-white/90 shadow-[0_1px_2px_0_rgba(0,0,0,0.6)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.12)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99]",
  secondary:
    "bg-[rgba(255,255,255,0.06)] text-white border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.20)] active:scale-[0.99]",
  ghost:
    "bg-transparent text-[#A1A1A6] hover:text-white hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.99]",
  gradient:
    "relative overflow-hidden text-white before:absolute before:inset-0 before:bg-[linear-gradient(135deg,#a78bfa_0%,#60a5fa_50%,#34d399_100%)] before:opacity-90 hover:before:opacity-100 before:transition-opacity before:duration-200 hover:shadow-[0_4px_24px_rgba(167,139,250,0.30)] hover:-translate-y-px active:translate-y-0",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-4 text-xs rounded-full gap-1.5",
  md: "h-10 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-7 text-base rounded-full gap-2.5",
};

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
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
        {variant === "gradient" ? (
          <span className="relative z-10">{children}</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";
