import { type ReactNode } from "react";

/** A full-bleed Apple section: alternating light/dark, generous space. */
export function AppleSection({
  id,
  dark = false,
  full = false,
  contentClassName = "max-w-5xl",
  children,
}: {
  id?: string;
  dark?: boolean;
  full?: boolean;
  /** @deprecated kept for call-site compatibility */
  cinematic?: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={[
        "relative overflow-hidden px-6 bg-(--apple-bg) text-(--apple-text)",
        dark ? "on-dark" : "",
        full ? "min-h-screen flex items-center py-28" : "py-24 md:py-32",
        id ? "scroll-mt-24" : "",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(70% 55% at 50% 0%, rgba(0,113,227,0.12) 0%, transparent 60%)"
            : "radial-gradient(70% 55% at 50% 0%, rgba(0,113,227,0.05) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className={`relative w-full mx-auto ${contentClassName}`}>{children}</div>
    </section>
  );
}
