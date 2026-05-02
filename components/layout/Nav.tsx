"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Sheet, SheetContent } from "@/components/sheet";
import { MenuToggle } from "@/components/menu-toggle";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { createClient } from "@/lib/supabase/client";
import { LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";

export function Nav() {
  const t = useTranslations("nav");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track auth state for mobile drawer
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setEmail(user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const links = [
    { label: t("team"), href: "#team" },
    { label: t("howItWorks"), href: "#how-it-works" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("manifesto"), href: "#manifesto" },
  ];

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const handleMobileSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  };

  const isLoggedIn = !!email;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className={[
          "transition-all duration-500",
          scrolled
            ? "backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border)]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="font-mono text-base font-bold tracking-[0.18em] text-[var(--text-primary)] hover:text-[var(--accent-glow)] transition-colors duration-200"
          >
            MENDLY
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 rounded-full hover:bg-[var(--surface)]/40"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center p-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/30">
              {(["en", "fr"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  aria-label={`Switch to ${l.toUpperCase()}`}
                  className={[
                    "px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all duration-200",
                    locale === l
                      ? "bg-[var(--accent-primary)] text-white shadow-sm"
                      : "text-[var(--text-dim)] hover:text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </div>

            <AccountMenu />

            <PremiumButton
              variant="primary"
              size="sm"
              onClick={() => router.push(isLoggedIn ? "/dashboard" : "/signup")}
            >
              {t("cta")}
            </PremiumButton>
          </div>

          {/* Mobile drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              className="flex md:hidden items-center justify-center p-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/30 text-[var(--text-muted)]"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <MenuToggle
                strokeWidth={2.5}
                open={open}
                onOpenChange={setOpen}
                className="size-5"
              />
            </button>
            <SheetContent
              side="left"
              showClose={false}
              className="bg-[var(--bg-primary)]/95 backdrop-blur-xl border-r border-[var(--border-strong)] flex flex-col"
            >
              <div className="grid gap-y-1 overflow-y-auto px-4 pt-16 pb-5 flex-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface)]/50 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Account section in mobile drawer */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="px-4 py-2 text-[10px] font-mono tracking-widest text-[var(--accent-glow)] uppercase">
                    {tAccount("section")}
                  </p>
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs text-[var(--text-dim)] mb-0.5">
                          {tAccount("loggedInAs")}
                        </p>
                        <p className="text-sm text-white truncate">{email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface)]/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[var(--accent-glow)]" />
                        {tAccount("dashboard")}
                      </Link>
                      <button
                        onClick={handleMobileSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface)]/50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        {tAccount("signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface)]/50 transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-[var(--accent-glow)]" />
                        {tAccount("signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface)]/50 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-[var(--accent-glow)]" />
                        {tAccount("signUp")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="px-4 pb-8 flex flex-col gap-3">
                <div className="flex gap-2">
                  {(["en", "fr"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        switchLocale(l);
                        setOpen(false);
                      }}
                      className={[
                        "flex-1 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-200",
                        locale === l
                          ? "bg-[var(--accent-primary)] text-white"
                          : "border border-[var(--border)] text-[var(--text-muted)]",
                      ].join(" ")}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <PremiumButton
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    router.push(isLoggedIn ? "/dashboard" : "/signup");
                    setOpen(false);
                  }}
                >
                  {t("cta")}
                </PremiumButton>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}