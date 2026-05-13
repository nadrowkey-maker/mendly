"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { AIAura } from "@/components/ui/AIAura";

const ease = [0.22, 1, 0.36, 1] as const;

export function FinalCtaSection() {
  const t = useTranslations("finalCta");
  const router = useRouter();

  return (
    <section
      id="manifesto"
      className="relative scroll-mt-20 overflow-hidden py-40 md:py-60 px-6 md:px-12 bg-black"
    >
      {/* AI aura — centered behind text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AIAura size={700} speed={8} opacity={0.75} glow />
      </div>

      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          viewport={{ once: true, margin: "-80px" }}
          className="font-bold leading-[1.05] tracking-tight text-white mb-6"
          style={{ fontSize: "clamp(40px, 7vw, 96px)" }}
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-xl text-[#86868b] mb-12 leading-[1.47] max-w-xl mx-auto"
        >
          {t("sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => router.push("/signup")}
            className="relative inline-flex items-center justify-center h-14 px-10 rounded-full text-white font-semibold text-base tracking-tight overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(191,90,242,0.35)] active:scale-[0.99] cursor-pointer"
            style={{ background: "linear-gradient(135deg,#BF5AF2 0%,#FF375F 40%,#0A84FF 100%)" }}
          >
            {t("cta")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
