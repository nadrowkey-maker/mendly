"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";

/**
 * Le choix de la langue.
 *
 * Il avait disparu avec l'ancienne barre de navigation. Le site est pourtant
 * écrit en deux langues complètes, et la langue par défaut est l'anglais : un
 * visiteur français arrivé sur la version anglaise n'avait plus aucun moyen
 * visible d'en sortir.
 *
 * Deux boutons plutôt qu'un menu déroulant : avec deux langues, un menu ajoute
 * un clic pour révéler un choix qu'on peut simplement montrer.
 */
interface LocaleSwitchProps {
  className?: string;
}

export function LocaleSwitch({ className }: LocaleSwitchProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("home.nav");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={[
        "inline-flex items-center rounded-full border border-(--paper-line) bg-white p-0.5",
        className ?? "",
      ].join(" ")}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) router.replace(pathname, { locale: l, scroll: false });
            }}
            className={[
              "h-7 min-w-9 cursor-pointer rounded-full px-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-primary)",
              active ? "bg-(--ink) text-white" : "text-(--ink-muted) hover:text-(--ink)",
            ].join(" ")}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
