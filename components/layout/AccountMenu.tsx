"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AccountMenu() {
  const t = useTranslations("account");
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setEmail(user?.email ?? null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
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
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isLoggedIn = !!email;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("ariaLabel")}
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)]/30 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-glow)]/50 transition-all"
      >
        <User className="w-4 h-4" />
        {isLoggedIn && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-(--accent-glow) ring-2 ring-[var(--bg-primary)]" />
        )}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-64 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-primary)]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {isLoggedIn ? (
              <>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-[10px] font-mono tracking-widest text-[var(--accent-glow)] uppercase mb-1">
                    {t("loggedInAs")}
                  </p>
                  <p className="text-sm text-white truncate">{email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]/60 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[var(--accent-glow)]" />
                    {t("dashboard")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]/60 transition-colors"
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]/60 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[var(--accent-glow)]" />
                  {t("signIn")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]/60 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-[var(--accent-glow)]" />
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