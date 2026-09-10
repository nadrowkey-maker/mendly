"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/supabase/auth-context";
import { PillLink } from "@/components/ui/Pill";
import { Menu, X } from "lucide-react";

/**
 * La barre de la vitrine.
 *
 * Elle ne flotte pas et ne porte pas de verre : elle est posée sur le papier,
 * et ne se détache qu'au défilement, par un filet. Une barre qui s'annonce dès
 * la première seconde vole l'attention au titre, qui est la seule chose que le
 * visiteur est venu lire.
 */
export function PaperNav() {
  const t = useTranslations("home.nav");
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("product"), href: "#produit" },
    { label: t("method"), href: "#methode" },
    { label: t("pricing"), href: "#tarifs" },
  ];

  return (
    <header
      className={[
        "sticky top-0 z-40 bg-(--paper)/85 backdrop-blur-xl transition-colors duration-300",
        scrolled ? "border-b border-(--paper-line-soft)" : "border-b border-transparent",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-(--ink)"
        >
          <Mark />
          mendly
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13.5px] text-(--ink-soft) transition-colors hover:text-(--ink)"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <PillLink href="/dashboard" tone="ink" size="sm">
              {t("dashboard")}
            </PillLink>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3.5 py-2 text-[13.5px] text-(--ink-soft) transition-colors hover:text-(--ink)"
              >
                {t("signin")}
              </Link>
              <PillLink href="/signup" tone="ink" size="sm">
                {t("cta")}
              </PillLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("close") : t("menu")}
          aria-expanded={open}
          className="grid size-9 place-items-center rounded-full text-(--ink) transition-colors hover:bg-(--paper-raised) md:hidden"
        >
          {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-(--paper-line-soft) px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[15px] text-(--ink-soft) transition-colors hover:bg-(--paper-raised) hover:text-(--ink)"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <PillLink href="/dashboard" tone="ink" size="md" className="w-full">
                {t("dashboard")}
              </PillLink>
            ) : (
              <>
                <PillLink href="/login" tone="paper" size="md" className="w-full">
                  {t("signin")}
                </PillLink>
                <PillLink href="/signup" tone="ink" size="md" className="w-full">
                  {t("cta")}
                </PillLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * La marque : trois barres décroissantes.
 *
 * Elles disent la même chose que le produit — plusieurs voix qui se rangent en
 * une seule position. Un monogramme rond aurait dit "encore une app".
 */
function Mark() {
  return (
    <svg viewBox="0 0 20 16" className="size-4.5" aria-hidden="true" fill="none">
      <rect x="0" y="1" width="20" height="2.2" rx="1.1" fill="currentColor" />
      <rect x="0" y="6.9" width="13" height="2.2" rx="1.1" fill="currentColor" opacity="0.6" />
      <rect x="0" y="12.8" width="7" height="2.2" rx="1.1" fill="currentColor" opacity="0.32" />
    </svg>
  );
}
