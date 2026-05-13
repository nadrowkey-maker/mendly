"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.25, 1, 0.5, 1] as const;

interface Step {
  num: string;
  title: string;
  desc: string;
}

const STEP_ACCENTS = ["#BF5AF2", "#FF375F", "#FF9F0A", "#0A84FF"] as const;

function StepNode({ step, index, reduced, isLast }: { step: Step; index: number; reduced: boolean; isLast: boolean }) {
  const accent = STEP_ACCENTS[index % STEP_ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: reduced ? 0 : index * 0.12, ease }}
      viewport={{ once: true, margin: "-60px" }}
      className="group/step flex flex-col items-center text-center cursor-default relative"
    >
      {/* Circle */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center mb-8 z-10 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] transition-all duration-300 group-hover/step:border-[rgba(255,255,255,0.16)] group-hover/step:bg-[rgba(255,255,255,0.07)]"
      >
        <span
          className="text-sm font-semibold"
          style={{ color: accent }}
        >
          {step.num}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-3 leading-tight">
        {step.title}
      </h3>
      <p className="text-sm text-[#6E6E73] leading-relaxed">
        {step.desc}
      </p>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");
  const reduced = useReducedMotion() ?? false;

  const steps: Step[] = [
    { num: t("step1Number"), title: t("step1Title"), desc: t("step1Desc") },
    { num: t("step2Number"), title: t("step2Title"), desc: t("step2Desc") },
    { num: t("step3Number"), title: t("step3Title"), desc: t("step3Desc") },
    { num: t("step4Number"), title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-black">
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 md:mb-28"
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

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting line */}
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-px bg-[rgba(255,255,255,0.06)] pointer-events-none" />
          {/* Animated data packet */}
          {!reduced && (
            <motion.div
              className="absolute top-6.5 w-8 h-0.5 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(to right, transparent, #BF5AF2, #0A84FF, transparent)",
                filter: "blur(0.5px)",
              }}
              animate={{ left: ["12.5%", "87.5%"] }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
            />
          )}

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <StepNode key={step.num} step={step} index={i} reduced={reduced} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="lg:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: reduced ? 0 : i * 0.1, ease }}
              viewport={{ once: true, margin: "-40px" }}
              className="flex gap-5"
            >
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center"
                >
                  <span className="text-xs font-semibold" style={{ color: STEP_ACCENTS[i % STEP_ACCENTS.length] }}>
                    {step.num}
                  </span>
                </div>
                {i < 3 && <div className="w-px flex-1 min-h-12 mt-2 bg-[rgba(255,255,255,0.06)]" />}
              </div>
              <div className={i < 3 ? "pb-10 pt-1" : "pt-1"}>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
