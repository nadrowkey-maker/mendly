interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Rendered in muted grey right after the title (Apple two-tone). */
  accent?: string;
  sub?: string;
  align?: "center" | "left";
  className?: string;
}

/** Apple-style section heading: small accent eyebrow, big tight headline, calm sub. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  sub,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      {eyebrow && (
        <p className="mb-3 text-[14px] font-semibold tracking-tight text-(--apple-accent)">{eyebrow}</p>
      )}

      <h2
        className="font-semibold tracking-[-0.022em] text-(--apple-text)"
        style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.07 }}
      >
        {title}
        {accent && <span className="text-(--apple-accent)"> {accent}</span>}
      </h2>

      {sub && (
        <p
          className={`mt-4 text-(--apple-text-2) max-w-2xl ${align === "center" ? "mx-auto" : ""}`}
          style={{ fontSize: "clamp(18px, 2.1vw, 21px)", lineHeight: 1.42 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
