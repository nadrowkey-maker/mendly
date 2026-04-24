"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShaderAnimation } from "@/components/shader-animation";
import { GradientText } from "@/components/ui/gradient-text";

const EDITORIAL_LINES = ["body1", "body2", "body3"] as const;

export function PromiseSection() {
  const t = useTranslations("promise");

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-black">
      {/* Shader rings — luminous backdrop */}
      <div className="absolute inset-0 opacity-55 overflow-hidden pointer-events-none">
        <ShaderAnimation />
      </div>

      {/* Soft vignette — keeps center legible without killing the glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_25%,rgba(0,0,0,0.55)_70%,black_100%)] pointer-events-none" />

      {/* Top / bottom edge fades */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Eyebrow + headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
            {t("title")}{" "}
            <GradientText as="span" className="rounded-sm bg-transparent dark:bg-transparent">
              <em className="font-fraunces">
                {t("titleEm")}
              </em>
            </GradientText>
          </h2>
        </motion.div>

        {/* Editorial paragraphs */}
        <div className="space-y-10 max-w-2xl mx-auto text-left">
          {EDITORIAL_LINES.map((key, i) => (
            <motion.p
              key={key}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.12 * (i + 1),
                ease: [0.25, 1, 0.5, 1],
              }}
              viewport={{ once: true, margin: "-60px" }}
              className={[
                "font-fraunces italic leading-relaxed",
                key === "body3"
                  ? "text-xl md:text-2xl text-(--accent-glow) font-semibold"
                  : "text-lg md:text-xl text-(--text-muted)",
              ].join(" ")}
            >
              {t(key)}
            </motion.p>
          ))}
        </div>

        {/* Support line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-14 text-center text-sm text-(--text-dim) tracking-wide"
        >
          {t("support")}
        </motion.p>
      </div>
    </section>
  );
}
