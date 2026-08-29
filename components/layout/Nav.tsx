"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Sheet, SheetContent } from "@/components/sheet";
import { MenuToggle } from "@/components/menu-toggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { LayoutDashboard, LogOut } from "lucide-react";

/**
 * La navigation — pilule flottante en verre.
 *
 * L'ancienne barre était blanche, héritée d'un passage "Apple clair" : posée
 * sur le noir absolu de la nouvelle direction, elle coupait la page en deux.
 *
 * Les liens vivent dans leur propre pilule, séparée du logo et des actions.
 * C'est ce triptyque — marque à gauche, pilule au centre, action à droite —
 * qui donne la lecture de console plutôt que de site vitrine.
 */
export function Nav() {
  const t = useTranslations("landing.nav");
  const tNav = useTranslations("nav");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const email = user?.email ?? null;
  const isLoggedIn = !!email;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("method"), href: "#methode" },
    { label: t("room"), href: "#salle" },
    { label: tNav("pricing"), href: "#tarifs" },
  ];

  const handleMobileSignOut = async () => {
    await createClient().auth.signOut();
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 transition-all duration-500 ${
          scrolled ? "opacity-100" : "opacity-95"
        }`}
      >
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
        >
          Mend<span className="text-(--accent-primary)">l</span>y
        </Link>

        {/* Pilule centrale */}
        <div className="hidden items-center gap-6 rounded-full border border-(--glass-line) bg-(--glass) px-6 py-2.5 backdrop-blur-xl md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm text-(--text-secondary) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <div className="flex items-center rounded-full border border-(--glass-line) bg-(--glass) p-0.5 backdrop-blur-xl">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => router.replace(pathname, { locale: l })}
                aria-label={`Passer en ${l.toUpperCase()}`}
                className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  locale === l ? "bg-white text-black" : "text-(--text-muted) hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <AccountMenu />

          <button
            onClick={() => router.push(isLoggedIn ? "/dashboard" : "/signup")}
            className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold tracking-tight text-black transition-all hover:-translate-y-px hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {isLoggedIn ? tAccount("dashboard") : tNav("cta")}
          </button>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            className="grid size-10 place-items-center rounded-full border border-(--glass-line) bg-(--glass) text-(--text-secondary) backdrop-blur-xl md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <MenuToggle strokeWidth={2} open={open} onOpenChange={setOpen} className="size-5" />
          </button>
          <SheetContent
            side="left"
            showClose={false}
            className="flex flex-col border-r border-(--glass-line) bg-[rgba(6,8,11,0.92)] backdrop-blur-2xl"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-5 pt-16">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-4 border-t border-(--glass-line) pt-4">
                <p className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
                  {tAccount("section")}
                </p>
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="mb-0.5 text-xs text-(--text-muted)">{tAccount("loggedInAs")}</p>
                      <p className="truncate text-sm text-white">{email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <LayoutDashboard className="size-4" />
                      {tAccount("dashboard")}
                    </Link>
                    <button
                      onClick={handleMobileSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <LogOut className="size-4" />
                      {tAccount("signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white"
                    >
                      {tAccount("signIn")}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-white"
                    >
                      {tAccount("signUp")}
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center gap-1 border-t border-(--glass-line) px-4 pt-4">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setOpen(false);
                      router.replace(pathname, { locale: l });
                    }}
                    className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                      locale === l ? "bg-white text-black" : "text-(--text-muted) hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
