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
        { label: t("col1Link1"), href: "/#how-it-works" },
        { label: t("col1Link2"), href: "/#team" },
        { label: t("col1Link3"), href: "/#pricing" },
        { label: t("col1Link4"), href: "/blog" },
      ],
    },
    {
      title: t("col2Title"),
      links: [
        { label: t("col2Link1"), href: "/manifesto" },
        { label: t("col2Link2"), href: "/blog" },
        { label: t("col2Link3"), href: "/careers" },
        { label: t("col2Link4"), href: "/contact" },
      ],
    },
    {
      title: t("col3Title"),
      links: [
        { label: t("col3Link1"), href: "/help" },
        { label: t("col3Link2"), href: "/security" },
        { label: t("col3Link3"), href: "/api-docs" },
        { label: t("col3Link4"), href: "/status" },
      ],
    },
    {
      title: t("col4Title"),
      links: [
        { label: t("col4Link1"), href: "/privacy" },
        { label: t("col4Link2"), href: "/terms" },
        { label: t("col4Link3"), href: "/cookies" },
        { label: t("col4Link4"), href: "/imprint" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-(--border) bg-(--bg-secondary) overflow-hidden">
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
              className="font-mono text-base font-bold tracking-[0.18em] text-(--text-primary) hover:text-(--accent-glow) transition-colors duration-200 block"
            >
              MENDLY
            </Link>
            <p className="text-sm text-(--text-dim) leading-relaxed mt-3 max-w-50">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i} className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.2em] text-(--text-dim) uppercase">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href as never}
                      className="text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-(--border) flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-(--text-dim) font-mono">
            {t("bottomLine1")}
          </p>
          <p className="text-xs text-(--text-dim) font-mono">
            {t("bottomLine2")}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
