"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GradientText } from "@/components/ui/gradient-text";

interface Step {
  num: string;
  title: string;
  desc: string;
}

function StepNode({
  step,
  index,
  reduced,
  isLast,
}: {
  step: Step;
  index: number;
  reduced: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.8,
        delay: reduced ? 0 : index * 0.13,
        ease: [0.25, 1, 0.5, 1],
      }}
      viewport={{ once: true, margin: "-60px" }}
      className="group/step flex flex-col items-center text-center cursor-pointer relative"
    >
      {/* Hover background card */}
      <div className="absolute inset-x-[-16px] inset-y-[-16px] rounded-3xl bg-(--surface)/0 group-hover/step:bg-(--surface)/70 border border-transparent group-hover/step:border-(--border) transition-all duration-400 pointer-events-none" />

      {/* Node circle */}
      <div className="relative w-16 h-16 rounded-full bg-(--surface) border border-(--border-strong) flex items-center justify-center mb-8 z-10 transition-all duration-300 shadow-[0_0_28px_rgba(139,92,246,0.4)] group-hover/step:shadow-[0_0_60px_rgba(139,92,246,0.85)] group-hover/step:border-(--accent-primary) group-hover/step:scale-110 group-hover/step:bg-(--surface-elevated)">
        <span className="font-mono text-sm font-bold text-(--accent-glow) group-hover/step:text-white transition-colors duration-300">
          {step.num}
        </span>
        {/* Inner ring pulse on hover */}
        <div className="absolute inset-[-4px] rounded-full border border-(--accent-primary)/0 group-hover/step:border-(--accent-primary)/40 transition-all duration-300" />
      </div>

      <h3 className="text-lg font-semibold text-(--text-primary) group-hover/step:text-white mb-3 leading-tight transition-colors duration-300 z-10 relative">
        {step.title}
      </h3>
      <p className="text-sm text-(--text-muted) group-hover/step:text-(--text-primary) leading-relaxed transition-colors duration-300 z-10 relative">
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
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-(--bg-primary)">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(139,92,246,0.13)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--bg-secondary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-secondary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
            {t("title")}{" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
        </motion.div>

        {/* Desktop: horizontal connected timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting gradient line */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-(--accent-primary) to-transparent opacity-40 pointer-events-none" />

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <StepNode
                key={step.num}
                step={step}
                index={i}
                reduced={reduced}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: reduced ? 0 : i * 0.1,
                ease: [0.25, 1, 0.5, 1],
              }}
              viewport={{ once: true, margin: "-40px" }}
              className="flex gap-5 group/mstep"
            >
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-(--surface) border border-(--border-strong) shadow-[0_0_16px_rgba(139,92,246,0.3)] group-hover/mstep:shadow-[0_0_32px_rgba(139,92,246,0.7)] group-hover/mstep:border-(--accent-primary) flex items-center justify-center transition-all duration-300">
                  <span className="font-mono text-xs font-bold text-(--accent-glow)">
                    {step.num}
                  </span>
                </div>
                {i < 3 && <div className="w-px flex-1 min-h-12 mt-2 bg-(--border)" />}
              </div>
              <div className={i < 3 ? "pb-10 pt-1" : "pt-1"}>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-(--text-muted) leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
