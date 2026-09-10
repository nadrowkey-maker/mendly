"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, CreditCard, Settings, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PillLink } from "@/components/ui/Pill";
import type { NavGroup, NavItem } from "@/components/app/nav-types";

/**
 * La barre latérale de l'atelier.
 *
 * C'est un panneau posé sur le sol, pas une colonne collée au bord : la marge
 * qui l'entoure est ce qui fait lire « panneau ». Sans elle, le fond du panneau
 * et le fond de la page se touchent, et il ne reste qu'un filet pour les
 * séparer — c'est-à-dire l'aspect d'un explorateur de fichiers.
 *
 * Les entrées sont regroupées sous des étiquettes de section. Onze liens à
 * plat se parcourent en les lisant tous ; les mêmes onze liens en trois
 * groupes se parcourent en lisant trois mots.
 */
interface AppSidebarProps {
  groups: NavGroup[];
  usageUsed: number;
  /** -1 pour illimité. */
  usageLimit: number;
  userPlan: string;
  userEmail: string | null;
  /** Nom affiché au-dessus de l'adresse — le projet courant, ou rien. */
  contextLabel?: string | null;
}

export function AppSidebar({
  groups,
  usageUsed,
  usageLimit,
  userPlan,
  userEmail,
  contextLabel,
}: AppSidebarProps) {
  const t = useTranslations("sidebar");
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  const ratio = usageLimit > 0 ? Math.min(1, usageUsed / usageLimit) : 0;
  const isFree = userPlan === "free";

  return (
    <aside className="flex h-full w-66 shrink-0 flex-col rounded-2xl bg-(--panel) p-3">
      <Link
        href="/dashboard"
        className="mb-5 flex items-center gap-2.5 px-3 pt-3 text-[15px] font-semibold tracking-tight text-white transition-opacity hover:opacity-70"
      >
        <Mark />
        mendly
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-1 flex items-center justify-between px-3">
              <p className="text-[11px] font-semibold tracking-tight text-white/38">
                {group.label}
              </p>
              {group.action && (
                <Link
                  href={group.action.href}
                  title={group.action.label}
                  aria-label={group.action.label}
                  className="grid size-5 place-items-center rounded-md text-white/30 transition-colors hover:bg-white/6 hover:text-white/75"
                >
                  <Plus className="size-3.5" />
                </Link>
              )}
            </div>

            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.label}>
                  <NavRow item={item} />
                </li>
              ))}
              {group.items.length === 0 && group.action && (
                <li>
                  <Link
                    href={group.action.href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] text-white/28 transition-colors hover:bg-white/4 hover:text-white/60"
                  >
                    <Plus className="size-4" />
                    {group.action.label}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-4 space-y-2">
        {/* Le compteur n'a de sens que s'il y a une limite. Affiché à
            « illimité », il rappelle une contrainte qui n'existe pas. */}
        {usageLimit !== -1 && (
          <div className="rounded-2xl border border-(--panel-line) p-3">
            <div className="h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-white/55 transition-[width] duration-500"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <p className="mt-2.5 text-[12px] text-white/45">
              {t("usageLine", { used: usageUsed, limit: usageLimit })}
            </p>
            {isFree && (
              <PillLink href="/upgrade" tone="light" size="sm" className="mt-2.5 w-full">
                {t("upgrade")}
              </PillLink>
            )}
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[12px] font-bold text-(--ink)"
            >
              {(contextLabel ?? userEmail ?? "?")[0]?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">
                {contextLabel ?? t("account")}
              </span>
              <span className="block truncate text-[12px] text-white/40">{userEmail ?? ""}</span>
            </span>
          </button>

          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-2xl border border-(--panel-line) bg-(--panel-raised) p-1 shadow-2xl"
              >
                <MenuLink href="/dashboard" icon={LayoutDashboard} label={t("dashboard")} onNavigate={() => setAccountOpen(false)} />
                <MenuLink href="/upgrade" icon={CreditCard} label={t("billing")} onNavigate={() => setAccountOpen(false)} />
                <MenuLink href="/settings" icon={Settings} label={t("settings")} onNavigate={() => setAccountOpen(false)} />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-red-500/12 hover:text-red-400"
                >
                  <LogOut className="size-3.5" />
                  {t("signOut")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

/** Une entrée : pilule pleine quand elle est active, transparente sinon. */
function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const shell = [
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
    item.active
      ? "bg-(--panel-raised) font-medium text-white"
      : "text-white/52 hover:bg-white/4 hover:text-white/85",
    item.disabled ? "pointer-events-none opacity-45" : "cursor-pointer",
  ].join(" ");

  const body = (
    <>
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate text-left">{item.label}</span>
      {!!item.count && item.count > 0 && (
        <span className="rounded-full bg-(--accent-primary)/18 px-1.5 py-0.5 font-mono text-[10px] text-(--accent-glow)">
          {item.count}
        </span>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href as never} className={shell}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={item.onClick} disabled={item.disabled} className={shell}>
      {body}
    </button>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href as never}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/7 hover:text-white"
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}

/** La marque, en clair sur le panneau — trois barres décroissantes. */
function Mark() {
  return (
    <svg viewBox="0 0 20 16" className="size-4.5" aria-hidden="true" fill="none">
      <rect x="0" y="1" width="20" height="2.2" rx="1.1" fill="currentColor" />
      <rect x="0" y="6.9" width="13" height="2.2" rx="1.1" fill="currentColor" opacity="0.6" />
      <rect x="0" y="12.8" width="7" height="2.2" rx="1.1" fill="currentColor" opacity="0.32" />
    </svg>
  );
}
