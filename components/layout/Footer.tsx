"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";

export function Footer() {
  const t = useTranslations("footer");

  const columns = [
    {
      title: t("col1Title"),
      links: [
        { label: t("col1Link1"), href: "#how-it-works" },
        { label: t("col1Link2"), href: "#team" },
        { label: t("col1Link3"), href: "#pricing" },
        { label: t("col1Link4"), href: "#" },
      ],
    },
    {
      title: t("col2Title"),
      links: [
        { label: t("col2Link1"), href: "#manifesto" },
        { label: t("col2Link2"), href: "#" },
        { label: t("col2Link3"), href: "#" },
        { label: t("col2Link4"), href: "#" },
      ],
    },
    {
      title: t("col3Title"),
      links: [
        { label: t("col3Link1"), href: "#" },
        { label: t("col3Link2"), href: "#" },
        { label: t("col3Link3"), href: "#" },
        { label: t("col3Link4"), href: "#" },
      ],
    },
    {
      title: t("col4Title"),
      links: [
        { label: t("col4Link1"), href: "#" },
        { label: t("col4Link2"), href: "#" },
        { label: t("col4Link3"), href: "#" },
        { label: t("col4Link4"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      {/* Top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
        style={{
          width: "600px",
          background:
            "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
          opacity: 0.5,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link
              href="/"
              className="font-mono text-base font-bold tracking-[0.18em] text-[var(--text-primary)] hover:text-[var(--accent-glow)] transition-colors duration-200 block"
            >
              MENDLY
            </Link>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed mt-3 max-w-[200px]">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i} className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-dim)] font-mono">
            {t("bottomLine1")}
          </p>
          <p className="text-xs text-[var(--text-dim)] font-mono">
            {t("bottomLine2")}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
