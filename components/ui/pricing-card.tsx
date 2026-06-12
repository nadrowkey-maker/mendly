import React from "react";
import { cn } from "@/lib/utils";

/**
 * Composable pricing-card primitives (from 21st.dev), recolored to the
 * Mendly dark / aurora design system.
 */

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full rounded-[28px] p-1.5 shadow-2xl backdrop-blur-xl",
        "border border-(--border-strong) bg-(--surface-1)",
        className
      )}
      {...props}
    />
  );
}

export function Header({
  className,
  children,
  glassEffect = true,
  ...props
}: React.ComponentProps<"div"> & { glassEffect?: boolean }) {
  return (
    <div
      className={cn(
        "relative mb-4 rounded-[22px] border border-(--border) bg-(--surface-2) p-4 overflow-hidden",
        className
      )}
      {...props}
    >
      {glassEffect && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}
      {children}
    </div>
  );
}

export function Plan({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-6 flex items-center justify-between", className)} {...props} />;
}

export function PlanName({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-semibold tracking-wide text-(--text-secondary) uppercase",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold text-white",
        className
      )}
      style={{ background: "linear-gradient(135deg,#a78bfa,#5b9dff)", borderColor: "transparent" }}
      {...props}
    />
  );
}

export function Price({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-2 flex items-end gap-1.5", className)} {...props} />;
}

export function MainPrice({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-4xl font-semibold tracking-tight text-(--text-primary)", className)}
      {...props}
    />
  );
}

export function Period({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("pb-1.5 text-sm text-(--text-muted)", className)} {...props} />;
}

export function Body({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-6 p-3", className)} {...props} />;
}

export function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("space-y-3", className)} {...props} />;
}

export function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li className={cn("flex items-start gap-3 text-sm text-(--text-secondary)", className)} {...props} />
  );
}
