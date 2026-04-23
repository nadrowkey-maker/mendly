"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe } from "@/components/ui/cobe-globe";
import { ShaderAnimation } from "@/components/neno-shader";

const markers: { id: string; location: [number, number]; label: string }[] = [
  { id: "sf", location: [37.7749, -122.4194], label: "San Francisco" },
  { id: "paris", location: [48.8566, 2.3522], label: "Paris" },
  { id: "tokyo", location: [35.6762, 139.6503], label: "Tokyo" },
  { id: "london", location: [51.5074, -0.1278], label: "London" },
  { id: "berlin", location: [52.52, 13.405], label: "Berlin" },
  { id: "sg", location: [1.3521, 103.8198], label: "Singapore" },
];

export function Trust() {
  const t = useTranslations("trust");

  const cards = [
    { icon: t("card1Icon"), title: t("card1Title"), desc: t("card1Desc") },
    { icon: t("card2Icon"), title: t("card2Title"), desc: t("card2Desc") },
    { icon: t("card3Icon"), title: t("card3Title"), desc: t("card3Desc") },
  ];

  return (
    <section
      id="trust"
      className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden"
    >
      {/* Ambient violet glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-[var(--accent-glow)] mb-4 uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold text-[var(--text-primary)] leading-[0.95] tracking-[-0.03em]">
            {t("title")}{" "}
            <span className="italic font-[family-name:var(--font-fraunces)] bg-gradient-to-r from-[var(--accent-glow)] to-[var(--accent-warm)] bg-clip-text text-transparent">
              {t("titleEm")}
            </span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Globe with neno-shader ambient glow */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex items-center justify-center"
          >
            {/* Neno-shader as a halo effect behind the globe */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <ShaderAnimation />
            </div>

            <Globe
              className="w-full max-w-[360px] mx-auto relative z-10"
              dark={1}
              baseColor={[0.082, 0.063, 0.165]}
              glowColor={[0.545, 0.361, 0.965]}
              markerColor={[0.655, 0.545, 0.98]}
              arcColor={[0.655, 0.545, 0.98]}
              markers={markers}
              speed={0.003}
              mapBrightness={4}
              diffuse={1.2}
            />
          </motion.div>

          {/* Right: trust cards + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col gap-4"
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)]/50 backdrop-blur-sm hover:border-[var(--accent-primary)]/40 transition-colors duration-300"
              >
                <div className="text-2xl mb-3" role="img" aria-hidden="true">
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}

            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              href="#"
              className="text-sm font-mono text-[var(--accent-glow)] hover:text-[var(--accent-primary)] transition-colors duration-200 mt-2 inline-flex items-center gap-2"
            >
              {t("cta")}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
