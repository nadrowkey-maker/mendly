"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * La console — la vraie interface de Mendly, posée sous le titre du hero.
 *
 * C'est la seule preuve dont le produit dispose : pas de logo client, pas de
 * témoignage. Elle doit donc montrer le produit qui travaille, pas une
 * illustration abstraite. Chaque chiffre correspond à un objet réel de
 * l'application (décisions en mémoire, actions enlisées, sessions autonomes).
 *
 * Basculée en perspective pour qu'elle s'enfonce dans la page plutôt que d'y
 * être collée, et traitée en verre liquide : le liseré clair sur l'arête haute
 * est ce qui la distingue d'un simple panneau translucide.
 */

const SIDE_ITEMS = [
  { key: "overview", active: true },
  { key: "sessions", active: false },
  { key: "memory", active: false },
  { key: "deliverables", active: false },
] as const;

const ICONS: Record<string, React.ReactNode> = {
  overview: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
  sessions: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5v4l2.5 1.5" />
    </>
  ),
  memory: (
    <>
      <path d="M3 3h10v10H3z" />
      <path d="M5.5 6.5h5M5.5 9.5h3" />
    </>
  ),
  deliverables: <path d="M3 12.5V4a1 1 0 0 1 1-1h5l4 4v5.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />,
};

export function ProductConsole() {
  const t = useTranslations("landing.console");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 [perspective:2000px] md:mt-24"
    >
      <div className="overflow-hidden rounded-2xl border border-(--glass-line) bg-gradient-to-b from-[rgba(14,19,26,0.82)] to-[rgba(6,8,11,0.92)] shadow-[inset_0_1px_0_var(--glass-hi),0_60px_140px_-50px_var(--accent-halo)] backdrop-blur-2xl [transform:rotateX(9deg)] [transform-origin:50%_0%] motion-reduce:[transform:none]">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between gap-4 border-b border-(--glass-line) px-4 py-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Mend<span className="text-(--accent-primary)">l</span>y
          </span>
          <div className="hidden flex-1 rounded-full border border-(--glass-line) bg-white/5 px-3 py-1 text-xs text-(--text-muted) sm:block sm:max-w-64">
            {t("search")}
          </div>
          {/* Aucun nom réel dans la démonstration : la maquette illustre le
              produit, elle n'expose pas l'identité de qui que ce soit. */}
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-(--accent-primary) to-[#1B4F8A] text-[10px] font-bold text-[#001322]"
          >
            M
          </span>
        </div>

        <div className="grid md:grid-cols-[168px_1fr]">
          {/* Colonne latérale */}
          <aside className="hidden border-r border-(--glass-line) px-3 py-4 md:block">
            <span className="mb-2 block px-2 font-mono text-[10px] tracking-[0.18em] text-(--text-muted)">
              {t("sideProject")}
            </span>
            <nav className="mb-5 flex flex-col gap-0.5">
              {SIDE_ITEMS.map((item) => (
                <span
                  key={item.key}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] ${
                    item.active
                      ? "bg-(--accent-primary)/12 text-white shadow-[inset_2px_0_0_var(--accent-primary)]"
                      : "text-(--text-secondary)"
                  }`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    aria-hidden="true"
                    className="size-3.5 shrink-0 opacity-75"
                  >
                    {ICONS[item.key]}
                  </svg>
                  {t(`side.${item.key}`)}
                </span>
              ))}
            </nav>
            <span className="mb-2 block px-2 font-mono text-[10px] tracking-[0.18em] text-(--text-muted)">
              {t("sideTeam")}
            </span>
            <span className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-(--text-secondary)">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className="size-3.5 shrink-0 opacity-75">
                <circle cx="8" cy="8" r="6" />
              </svg>
              {t("side.room")}
            </span>
          </aside>

          {/* Corps */}
          <div className="px-4 py-4 md:px-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-lg font-medium tracking-tight text-white">Project 1</span>
              <span className="rounded-full border border-(--accent-primary)/35 bg-(--accent-primary)/8 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-(--accent-glow)">
                {t("badge")}
              </span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {(["decisions", "stalled", "sessions", "next"] as const).map((k) => (
                <div key={k} className="rounded-xl border border-(--glass-line) bg-white/2 px-3 py-2.5">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
                    {t(`metric.${k}.label`)}
                  </span>
                  <span className="mt-1 block text-2xl font-extralight leading-tight tracking-tight text-white tabular-nums">
                    {t(`metric.${k}.value`)}
                  </span>
                  <span className={`block text-xs ${k === "decisions" ? "text-(--accent-glow)" : "text-(--text-secondary)"}`}>
                    {t(`metric.${k}.hint`)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-3 rounded-xl border border-(--glass-line) bg-white/2 px-3 pb-1 pt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[13px] text-(--text-secondary)">{t("chartTitle")}</span>
                <div className="flex gap-3 text-[11px] text-(--text-muted)">
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block size-1.5 rounded-full bg-(--accent-primary)" />
                    {t("legendSessions")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block size-1.5 rounded-full bg-(--signal)" />
                    {t("legendTensions")}
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 620 130" className="h-28 w-full" preserveAspectRatio="none" role="img" aria-label={t("chartTitle")}>
                <defs>
                  <linearGradient id="consoleFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="32" x2="620" y2="32" stroke="rgba(255,255,255,0.06)" />
                <line x1="0" y1="70" x2="620" y2="70" stroke="rgba(255,255,255,0.06)" />
                <line x1="0" y1="108" x2="620" y2="108" stroke="rgba(255,255,255,0.06)" />
                <path
                  d="M0 104 C70 96 110 72 170 78 C240 85 270 40 340 44 C410 48 440 26 500 30 C560 34 590 18 620 14 L620 130 L0 130 Z"
                  fill="url(#consoleFill)"
                />
                <path
                  d="M0 104 C70 96 110 72 170 78 C240 85 270 40 340 44 C410 48 440 26 500 30 C560 34 590 18 620 14"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="1.8"
                />
                <path
                  d="M0 118 C80 116 130 108 200 110 C280 112 320 98 390 100 C460 102 500 92 620 88"
                  fill="none"
                  stroke="var(--signal)"
                  strokeWidth="1.4"
                  strokeOpacity="0.75"
                />
                <circle cx="620" cy="14" r="3.5" fill="var(--accent-primary)" />
              </svg>
            </div>

            {/* Contradiction interne — marqueur typographique, jamais un pictogramme. */}
            <div className="border-l-2 border-(--signal) py-2 pl-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--signal)">
                {t("tensionLabel")}
              </span>
              <p className="text-sm text-white">{t("tensionBody")}</p>
            </div>
            <p className="mt-2.5 text-[13px] text-(--text-secondary)">
              <span className="font-semibold text-white">{t("verdictLabel")}</span> {t("verdictBody")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
