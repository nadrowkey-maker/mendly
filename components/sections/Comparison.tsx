"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

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
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[rgba(48,209,88,0.15)] shrink-0">
          <Check className="w-3 h-3 text-[#30D158]" />
        </span>
        {label && <span className="text-sm text-white/90">{label}</span>}
      </span>
    );
  }
  if (text.includes("❌")) {
    const label = text.replace("❌", "").trim();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[rgba(255,55,95,0.12)] shrink-0">
          <X className="w-3 h-3 text-[#FF375F]" />
        </span>
        {label && <span className="text-sm text-[#6E6E73]">{label}</span>}
      </span>
    );
  }
  if (text.includes("⚠")) {
    const label = text.replace(/⚠️|⚠/g, "").trim();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[rgba(255,159,10,0.12)] shrink-0">
          <AlertTriangle className="w-3 h-3 text-[#FF9F0A]" />
        </span>
        {label && <span className="text-sm text-[#6E6E73]">{label}</span>}
      </span>
    );
  }
  return <span className="text-sm text-white/90">{text}</span>;
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
    <section id="comparison" className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] mb-6 uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white mb-4"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
          <p className="text-[#86868b] max-w-xl mx-auto text-xl leading-[1.47]">
            {t("sub")}
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          viewport={{ once: true, margin: "-80px" }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[560px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="py-4 px-6 text-left text-[10px] tracking-[0.2em] text-[#6E6E73] uppercase border-b border-[rgba(255,255,255,0.06)] w-[36%]">
                  {t("headerFeature")}
                </th>
                <th className="py-4 px-4 text-center text-[10px] tracking-[0.2em] text-[#6E6E73] uppercase border-b border-[rgba(255,255,255,0.06)]">
                  {t("headerChatgpt")}
                </th>
                <th className="py-4 px-4 text-center text-[10px] tracking-[0.2em] text-[#6E6E73] uppercase border-b border-[rgba(255,255,255,0.06)]">
                  {t("headerLovable")}
                </th>
                {/* Mendly column — AI gradient top border */}
                <th className="py-4 px-6 text-center text-[10px] tracking-[0.2em] uppercase bg-[rgba(191,90,242,0.06)] border-l border-r border-t border-[rgba(191,90,242,0.20)] rounded-t-xl relative">
                  <span className="ai-gradient-text font-semibold">{t("headerMendly")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="group/row hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150">
                  <td className="py-4 px-6 text-sm text-white/80 border-b border-[rgba(255,255,255,0.05)]">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-left border-b border-[rgba(255,255,255,0.05)]">
                    <CellContent text={row.chatgpt} />
                  </td>
                  <td className="py-4 px-4 text-left border-b border-[rgba(255,255,255,0.05)]">
                    <CellContent text={row.lovable} />
                  </td>
                  <td
                    className={[
                      "py-4 px-6 text-left bg-[rgba(191,90,242,0.06)] border-l border-r border-[rgba(191,90,242,0.20)]",
                      i === rows.length - 1
                        ? "border-b border-b-[rgba(191,90,242,0.20)] rounded-b-xl"
                        : "border-b border-b-[rgba(255,255,255,0.05)]",
                    ].join(" ")}
                  >
                    <CellContent text={row.mendly} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-xs tracking-wider text-[#6E6E73] uppercase"
        >
          {t("caption")}
        </motion.p>
      </div>
    </section>
  );
}
