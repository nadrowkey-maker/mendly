"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, LayoutDashboard, Settings, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";

/**
 * Le menu de compte.
 *
 * Deux choix de traitement qui le sortent du panneau générique :
 * — l'avatar porte les initiales du fondateur, pas un pictogramme d'utilisateur
 *   anonyme. C'est SON compte, et la console produit utilise déjà ce motif ;
 * — l'accent ne colore aucun pictogramme. Les icônes restent neutres, l'azur
 *   n'apparaît que sur la pastille d'état connecté. Un accent posé partout ne
 *   signale plus rien.
 */

const ROW =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--accent-glow)";

function initialsFrom(email: string | null): string {
  if (!email) return "";
  const handle = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  return handle.slice(0, 2).toUpperCase() || "?";
}

export function AccountMenu() {
  const t = useTranslations("account");
  const { user, loading } = useAuth();
  const email = user?.email ?? null;
  const isLoggedIn = !!user;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("ariaLabel")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative grid size-9 place-items-center rounded-full border border-(--glass-line) bg-(--glass) backdrop-blur-xl transition-colors hover:border-(--glass-hi) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)"
      >
        {isLoggedIn ? (
          <span className="text-[11px] font-bold tracking-tight text-white">
            {initialsFrom(email)}
          </span>
        ) : (
          <User className="size-4 text-(--text-secondary)" />
        )}
        {isLoggedIn && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-(--accent-primary) ring-2 ring-black" />
        )}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-(--glass-line) bg-[rgba(8,11,15,0.82)] shadow-[inset_0_1px_0_var(--glass-hi),0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            {isLoggedIn ? (
              <>
                <div className="border-b border-(--glass-line) px-4 py-3">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
                    {t("loggedInAs")}
                  </p>
                  <p className="truncate text-sm text-white">{email}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/dashboard" onClick={() => setOpen(false)} className={ROW} role="menuitem">
                    <LayoutDashboard className="size-4" />
                    {t("dashboard")}
                  </Link>
                  <Link href="/settings" onClick={() => setOpen(false)} className={ROW} role="menuitem">
                    <Settings className="size-4" />
                    {t("settings")}
                  </Link>
                  <button onClick={handleSignOut} className={ROW} role="menuitem">
                    <LogOut className="size-4" />
                    {t("signOut")}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-1.5">
                <Link href="/login" onClick={() => setOpen(false)} className={ROW} role="menuitem">
                  <LogIn className="size-4" />
                  {t("signIn")}
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className={ROW} role="menuitem">
                  <UserPlus className="size-4" />
                  {t("signUp")}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
