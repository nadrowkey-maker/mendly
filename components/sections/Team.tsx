"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef, useMemo } from "react";
import { AGENTS } from "@/lib/agents";
import { SplineScene } from "@/components/ui/splite";

export function TeamSection() {
  const t = useTranslations("team");
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // On simplifie à mort les calculs de scroll
  const robotOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0.5, 0.5]);
  
  // On mémoïse les cartes pour éviter que React ne pète un câble
  const cards = useMemo(() => AGENTS.map((agent, i) => ({
    ...agent,
    role: t(`${agent.id}Role`),
    title: t(`${agent.id}Title`),
    index: i
  })), [t]);

  return (
    <section ref={sectionRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div style={{ opacity: robotOpacity }} className="absolute inset-0">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>
        
        {/* Grille de cartes simplifiée */}
        <div className="absolute inset-x-0 bottom-10 z-10 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {cards.map((agent) => (
              <div key={agent.id} className="p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                <p className="text-[var(--glow)] font-bold">{agent.role}</p>
                <p className="text-xs text-gray-400">{agent.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}