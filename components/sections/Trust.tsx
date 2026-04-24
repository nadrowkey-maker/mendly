"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion"; // On ajoute useInView ici
import { Globe } from "@/components/ui/cobe-globe";
import { ShaderAnimation } from "@/components/neno-shader";
import { GradientText } from "@/components/ui/gradient-text";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Globe as GlobeIcon } from "lucide-react";

const markers = [
  { id: "seoul", label: "Seoul", location: [37.5665, 126.978] as [number, number], size: 0.1 }, 
  { id: "busan", label: "Busan", location: [35.1796, 129.0756] as [number, number], size: 0.07 }, 
  { id: "paris", label: "Paris", location: [48.8566, 2.3522] as [number, number], size: 0.05 }, 
  { id: "la", label: "LA", location: [34.0522, -118.2437] as [number, number], size: 0.05 }, 
  { id: "tokyo", label: "Tokyo", location: [35.6762, 139.6503] as [number, number], size: 0.05 }, 
];

export function Trust() {
  const t = useTranslations("trust");
  const sectionRef = useRef<HTMLElement>(null);
  
  // LA SÉCURITÉ : On détecte si la section est visible (avec une marge de 200px)
  const isInView = useInView(sectionRef, { margin: "200px 0px" });

  const cards = [
    { icon: Shield, title: t("card1Title"), desc: t("card1Desc"), color: "text-blue-400" },
    { icon: Zap, title: t("card2Title"), desc: t("card2Desc"), color: "text-yellow-400" },
    { icon: GlobeIcon, title: t("card3Title"), desc: t("card3Desc"), color: "text-purple-400" },
  ];

  return (
    <section 
      ref={sectionRef} // On lie la ref ici
      id="trust" 
      className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400 bg-purple-500/5 px-4 py-1">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t("title")}{" "}
            <GradientText as="span">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div className="relative flex items-center justify-center">
            
            {/* CONDITION : Le shader Neno ne s'active QUE si isInView est vrai */}
            <div className="absolute inset-0 opacity-20 pointer-events-none rounded-full overflow-hidden">
              {isInView && <ShaderAnimation />}
            </div>

            {/* CONDITION : Le Globe WebGL ne s'active QUE si isInView est vrai */}
            {isInView && (
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
            )}
          </motion.div>

          <div className="flex flex-col gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-black/20 ${card.color}`}>
                      <card.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}