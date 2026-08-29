"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/**
 * Le pied de page.
 *
 * Trois corrections par rapport à la version précédente :
 * — les liens produit pointaient vers #how-it-works, #team et #pricing, trois
 *   ancres qui n'existent plus depuis la reconstruction de la landing. Un pied
 *   de page qui renvoie dans le vide est pire que pas de pied de page ;
 * — la signature vendait "l'équipe que tu ne pouvais pas te payer", c'est-à-dire
 *   le produit à huit agents ;
 * — les couleurs passent par les tokens du système au lieu d'opacités blanches
 *   codées en dur, pour suivre la charte si elle évolue.
 */
export function Footer() {
  const t = useTranslations("footer");

  const columns = [
    {
      title: t("col1Title"),
      links: [
        { label: t("col1Link1"), href: "/#methode" },
        { label: t("col1Link2"), href: "/#salle" },
        { label: t("col1Link3"), href: "/#tarifs" },
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
        { label: t("col4Link4"), href: "/refund" },
        { label: t("col4Link5"), href: "/legal" },
      ],
    },
  ];

  return (
    <footer className="border-t border-(--glass-line) bg-black">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-12">
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Link
              href="/"
              className="block text-sm font-bold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
            >
              Mend<span className="text-(--accent-primary)">l</span>y
            </Link>
            <p className="max-w-48 text-sm leading-relaxed text-(--text-muted)">{t("tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href as never}
                      className="text-sm text-(--text-secondary) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-(--glass-line) pt-8 md:flex-row">
          <p className="font-mono text-[11px] tracking-widest text-(--text-muted)">
            {t("bottomLine1")}
          </p>
          <p className="font-mono text-[11px] tracking-widest text-(--text-muted)">
            {t("bottomLine2")}
          </p>
        </div>
      </div>
    </footer>
  );
}
