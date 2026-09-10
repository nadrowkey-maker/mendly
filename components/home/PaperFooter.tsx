"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/**
 * Le pied de page de la vitrine.
 *
 * Il reprend les colonnes du pied sombre — mêmes libellés, mêmes destinations —
 * mais sur papier. Les deux existent en parallèle : les pages légales et les
 * pages de l'atelier gardent le fond sombre, la vitrine passe au clair, et
 * chacune finit sur le pied qui lui correspond.
 *
 * Les ancres produit pointent vers les sections réelles de la nouvelle page.
 * Un pied de page qui renvoie vers une ancre disparue est pire que pas de pied
 * de page : il donne l'impression d'un site qui n'est plus tenu.
 */
export function PaperFooter() {
  const t = useTranslations("footer");

  const columns = [
    {
      title: t("col1Title"),
      links: [
        { label: t("col1Link1"), href: "/#methode" },
        { label: t("col1Link2"), href: "/#produit" },
        { label: t("col1Link3"), href: "/#tarifs" },
      ],
    },
    {
      title: t("col2Title"),
      links: [
        { label: t("col2Link1"), href: "/manifesto" },
        { label: t("col2Link2"), href: "/contact" },
      ],
    },
    {
      title: t("col3Title"),
      links: [
        { label: t("col3Link1"), href: "/help" },
        { label: t("col3Link2"), href: "/security" },
        { label: t("col3Link3"), href: "/status" },
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
    <footer className="border-t border-(--paper-line) bg-(--paper)">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-(--ink) transition-opacity hover:opacity-60"
            >
              mendly
            </Link>
            <p className="mt-3 max-w-48 text-[13px] leading-relaxed text-(--ink-muted)">
              {t("tagline")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--ink-muted)">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href as never}
                      className="text-[13px] text-(--ink-soft) transition-colors hover:text-(--ink)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-(--paper-line) pt-7 md:flex-row">
          <p className="font-mono text-[11px] tracking-wide text-(--ink-muted)">
            {t("bottomLine1")}
          </p>
          <p className="font-mono text-[11px] tracking-wide text-(--ink-muted)">
            {t("bottomLine2")}
          </p>
        </div>
      </div>
    </footer>
  );
}
