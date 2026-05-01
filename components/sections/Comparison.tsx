"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";

type Row = {
  feature: string;
  chatgpt: string;
  lovable: string;
  mendly: string;
};

function CellContent({ text }: { text: string }) {
  if (text.includes("✅")) {
    const label = text.replace("✅", "").trim();
    return (
      <span className="inline-flex items-center gap-1.5 justify-center">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 shrink-0">
          <Check className="w-3 h-3 text-emerald-400" />
        </span>
        {label && <span className="text-sm text-(--text-primary)">{label}</span>}
      </span>
    );
  }
  if (text.includes("❌")) {
    const label = text.replace("❌", "").trim();
    return (
      <span className="inline-flex items-center gap-1.5 justify-center">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/15 shrink-0">
          <X className="w-3 h-3 text-red-400" />
        </span>
        {label && <span className="text-sm text-(--text-muted)">{label}</span>}
      </span>
    );
  }
  if (text.includes("⚠")) {
    const label = text.replace(/⚠️|⚠/g, "").trim();
    return (
      <span className="inline-flex items-center gap-1.5 justify-center">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
        </span>
        {label && <span className="text-sm text-(--text-muted)">{label}</span>}
      </span>
    );
  }
  return <span className="text-sm text-(--text-primary)">{text}</span>;
}

export function Comparison() {
  const t = useTranslations("comparison");

  const rows: Row[] = [
    { feature: t("row1Feature"), chatgpt: t("row1Chatgpt"), lovable: t("row1Lovable"), mendly: t("row1Mendly") },
    { feature: t("row2Feature"), chatgpt: t("row2Chatgpt"), lovable: t("row2Lovable"), mendly: t("row2Mendly") },
    { feature: t("row3Feature"), chatgpt: t("row3Chatgpt"), lovable: t("row3Lovable"), mendly: t("row3Mendly") },
    { feature: t("row4Feature"), chatgpt: t("row4Chatgpt"), lovable: t("row4Lovable"), mendly: t("row4Mendly") },
    { feature: t("row5Feature"), chatgpt: t("row5Chatgpt"), lovable: t("row5Lovable"), mendly: t("row5Mendly") },
    { feature: t("row6Feature"), chatgpt: t("row6Chatgpt"), lovable: t("row6Lovable"), mendly: t("row6Mendly") },
    { feature: t("row7Feature"), chatgpt: t("row7Chatgpt"), lovable: t("row7Lovable"), mendly: t("row7Mendly") },
  ];

  return (
    <section
      id="comparison"
      className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden"
    >
      {/* Static ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 25%, var(--bg-primary) 72%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) mb-4 uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold text-(--text-primary) leading-[0.95] tracking-[-0.03em] mb-4">
            {t("title")}{" "}
            <span className="italic font-[family-name:var(--font-fraunces)] bg-gradient-to-r from-(--accent-glow) to-(--accent-warm) bg-clip-text text-transparent">
              {t("titleEm")}
            </span>
          </h2>
          <p className="text-(--text-muted) max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            {t("sub")}
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[560px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="py-4 px-6 text-left text-[10px] font-mono tracking-[0.2em] text-(--text-dim) uppercase border-b border-(--border) w-[36%]">
                  {t("headerFeature")}
                </th>
                <th className="py-4 px-4 text-center text-[10px] font-mono tracking-[0.2em] text-(--text-muted) uppercase border-b border-(--border)">
                  {t("headerChatgpt")}
                </th>
                <th className="py-4 px-4 text-center text-[10px] font-mono tracking-[0.2em] text-(--text-muted) uppercase border-b border-(--border)">
                  {t("headerLovable")}
                </th>
                <th className="py-4 px-6 text-center text-[10px] font-mono tracking-[0.2em] text-(--accent-glow) uppercase bg-(--accent-primary)/10 border-l border-r border-t border-(--border-strong) rounded-t-xl">
                  {t("headerMendly")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="group/row hover:bg-(--surface)/30 transition-colors duration-150">
                  <td className="py-4 px-6 text-sm text-(--text-primary) border-b border-(--border)">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center border-b border-(--border)">
                    <CellContent text={row.chatgpt} />
                  </td>
                  <td className="py-4 px-4 text-center border-b border-(--border)">
                    <CellContent text={row.lovable} />
                  </td>
                  <td
                    className={[
                      "py-4 px-6 text-center",
                      "bg-(--accent-primary)/10 border-l border-r border-(--border-strong)",
                      i === rows.length - 1
                        ? "border-b border-b-(--border-strong) rounded-b-xl"
                        : "border-b border-b-(--border)",
                    ].join(" ")}
                  >
                    <CellContent text={row.mendly} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-xs font-mono tracking-wider text-(--text-dim) uppercase"
        >
          {t("caption")}
        </motion.p>
      </div>
    </section>
  );
}
