"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Globe } from "@/components/ui/cobe-globe";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe as GlobeIcon } from "lucide-react";
import { Link } from "@/i18n/routing";

const markers = [
  { id: "seoul", label: "Seoul", location: [37.5665, 126.978] as [number, number], size: 0.1 },
  { id: "busan", label: "Busan", location: [35.1796, 129.0756] as [number, number], size: 0.07 },
  { id: "paris", label: "Paris", location: [48.8566, 2.3522] as [number, number], size: 0.05 },
  { id: "la", label: "LA", location: [34.0522, -118.2437] as [number, number], size: 0.05 },
  { id: "tokyo", label: "Tokyo", location: [35.6762, 139.6503] as [number, number], size: 0.05 },
];

export function Trust() {
  const t = useTranslations("trust");
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "0px", once: true });

  const cards = [
    {
      icon: Shield,
      title: t("card1Title"),
      desc: t("card1Desc"),
      color: "var(--accent-glow)",
      glowRgb: "139, 92, 246",
    },
    {
      icon: Zap,
      title: t("card2Title"),
      desc: t("card2Desc"),
      color: "var(--accent-hot)",
      glowRgb: "6, 182, 212",
    },
    {
      icon: GlobeIcon,
      title: t("card3Title"),
      desc: t("card3Desc"),
      color: "var(--accent-warm)",
      glowRgb: "240, 171, 252",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="relative bg-[#080808] overflow-hidden py-24 md:py-32 px-6 md:px-12"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-10"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-white/40 uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white mb-4"
            style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
        </motion.div>

        {/* Globe â€” decorative, centered, modest size */}
        <motion.div
          initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="relative mx-auto w-56 h-56 md:w-80 md:h-80 my-8 md:my-12"
        >
          <div
            className="absolute inset-0 -z-10 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.22) 0%, transparent 70%)",
            }}
          />
          {isInView && (
            <Globe
              className="w-full h-full"
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
          )}
        </motion.div>

        {/* 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: reduced ? 0 : i * 0.1,
                ease: [0.25, 1, 0.5, 1],
              }}
              viewport={{ once: true, margin: "-40px" }}
            >
              <Card
                className="bg-(--surface)/80 border rounded-2xl hover:scale-[1.02] transition-transform duration-300 h-full"
                style={{
                  borderColor: `rgba(${card.glowRgb}, 0.35)`,
                  boxShadow: `0 0 40px rgba(${card.glowRgb}, 0.12)`,
                }}
              >
                <CardContent className="p-5 md:p-6 flex flex-col gap-4 h-full">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `rgba(${card.glowRgb}, 0.15)`,
                    }}
                  >
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1.5 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-(--text-muted) text-xs md:text-sm leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <Link
            href="/security"
            className="text-sm text-(--accent-glow) hover:text-(--accent-warm) transition-colors duration-200"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

