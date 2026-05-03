"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogIn, UserPlus, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";

export function AccountMenu() {
  const t = useTranslations("account");
  const router = useRouter();
  const { user, loading } = useAuth();
  const email = user?.email ?? null;
  const isLoggedIn = !!user;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
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
        className="flex items-center justify-center w-9 h-9 rounded-full border border-(--border) bg-(--surface)/30 text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-glow)/50 transition-all"
      >
        <User className="w-4 h-4" />
        {isLoggedIn && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-(--accent-glow) ring-2 ring-(--bg-primary)" />
        )}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-64 rounded-2xl border border-(--border-strong) bg-(--bg-primary)/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {isLoggedIn ? (
              <>
                <div className="px-4 py-3 border-b border-(--border)">
                  <p className="text-[10px] font-mono tracking-widest text-(--accent-glow) uppercase mb-1">
                    {t("loggedInAs")}
                  </p>
                  <p className="text-sm text-white truncate">{email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-white hover:bg-(--surface)/60 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-(--accent-glow)" />
                    {t("dashboard")}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-white hover:bg-(--surface)/60 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-(--accent-glow)" />
                    {t("settings")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-white hover:bg-(--surface)/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("signOut")}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-1.5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-white hover:bg-(--surface)/60 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-(--accent-glow)" />
                  {t("signIn")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-white hover:bg-(--surface)/60 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-(--accent-glow)" />
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
