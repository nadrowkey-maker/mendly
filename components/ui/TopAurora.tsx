"use client";

/**
 * Big multicolor aurora that spills from the top edge of the page, pointing
 * down. The signature glow of the whole site (Grok / Gemini vibe).
 */
export function TopAurora({ className = "" }: { className?: string }) {
  return (
    <div className={`top-aurora ${className}`} aria-hidden>
      <span className="ta ta-1" />
      <span className="ta ta-2" />
      <span className="ta ta-3" />
      <span className="ta ta-4" />
    </div>
  );
}
