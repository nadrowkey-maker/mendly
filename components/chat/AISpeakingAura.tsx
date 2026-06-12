"use client";

/**
 * Big living multicolor cloud for the agent workspace. Drifts gently at rest;
 * brightens and speeds up when an agent is generating (`active`).
 * Apple-Intelligence vibe — calm until the AI speaks.
 */
export function AISpeakingAura({ active }: { active: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-35"
      }`}
      aria-hidden
    >
      <div className={`aurora-cloud ${active ? "is-live" : ""}`}>
        <span className="ac ac-1" />
        <span className="ac ac-2" />
        <span className="ac ac-3" />
        <span className="ac ac-4" />
      </div>
    </div>
  );
}
