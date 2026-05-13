"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const EDITORIAL_LINES = ["body1", "body2", "body3"] as const;
const ease = [0.25, 1, 0.5, 1] as const;

export function PromiseSection() {
  const t = useTranslations("promise");

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-black">
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Eyebrow + headline */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
        </motion.div>

        {/* Editorial paragraphs */}
        <div className="space-y-10 max-w-2xl mx-auto text-left">
          {EDITORIAL_LINES.map((key, i) => (
            <motion.p
              key={key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * (i + 1), ease }}
              viewport={{ once: true, margin: "-60px" }}
              className={[
                "font-fraunces italic leading-relaxed",
                key === "body3"
                  ? "text-xl md:text-2xl text-white/80 font-semibold"
                  : "text-lg md:text-xl text-[#6E6E73]",
              ].join(" ")}
            >
              {t(key)}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-14 text-center text-sm text-[#6E6E73] tracking-wide"
        >
          {t("support")}
        </motion.p>
      </div>
    </section>
  );
}
