"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export interface DisplayCardProps {
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  date?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-white" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  titleClassName = "text-(--accent-glow)",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-40 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-2xl border-2 border-(--border-strong) bg-(--surface-2) backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-(--apple-bg) after:to-transparent after:content-[''] after:transition-opacity after:duration-700 hover:after:opacity-0 hover:z-50 hover:-translate-y-10 hover:skew-y-0 hover:border-(--apple-accent) hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-(--apple-accent) p-1.5">{icon}</span>
        <p className={cn("text-lg font-semibold", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-[15px] text-(--text-secondary)">{description}</p>
      <p className="text-[12px] uppercase tracking-[0.15em] text-(--text-dim)">{date}</p>
    </div>
  );
}

export function DisplayCards({ cards }: { cards: DisplayCardProps[] }) {
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
