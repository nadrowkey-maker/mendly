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
import { useAuth } from "@/lib/supabase/auth-context";
import { LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";

export function Nav() {
  const t = useTranslations("nav");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={[
          "w-full max-w-5xl rounded-2xl transition-all duration-500",
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
            : "bg-black/40 backdrop-blur-xl border border-[rgba(255,255,255,0.05)]",
        ].join(" ")}
      >
        <nav className="flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.15em] text-white/90 hover:text-white transition-colors duration-200"
          >
            MENDLY
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-[#6E6E73] hover:text-white transition-colors duration-200 rounded-xl"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <div className="flex items-center p-0.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
              {(["en", "fr"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  aria-label={`Switch to ${l.toUpperCase()}`}
                  className={[
                    "px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer",
                    locale === l
                      ? "bg-white text-black font-semibold"
                      : "text-[#6E6E73] hover:text-[#A1A1A6]",
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
              {isLoggedIn ? tAccount("dashboard") : t("cta")}
            </PremiumButton>
          </div>

          {/* Mobile menu toggle */}
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              className="flex md:hidden items-center justify-center p-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#A1A1A6]"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <MenuToggle
                strokeWidth={2}
                open={open}
                onOpenChange={setOpen}
                className="size-5"
              />
            </button>
            <SheetContent
              side="left"
              showClose={false}
              className="bg-black/95 backdrop-blur-2xl border-r border-[rgba(255,255,255,0.08)] flex flex-col"
            >
              <div className="grid gap-y-0.5 overflow-y-auto px-4 pt-16 pb-5 flex-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-[#A1A1A6] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="px-4 py-2 text-[10px] tracking-widest text-[#6E6E73] uppercase">
                    {tAccount("section")}
                  </p>
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs text-[#6E6E73] mb-0.5">{tAccount("loggedInAs")}</p>
                        <p className="text-sm text-white truncate">{email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[#A1A1A6] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {tAccount("dashboard")}
                      </Link>
                      <button
                        onClick={handleMobileSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#A1A1A6] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left cursor-pointer"
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
                        className="flex items-center gap-3 px-4 py-3 text-[#A1A1A6] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        {tAccount("signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[#A1A1A6] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
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
                      onClick={() => { switchLocale(l); setOpen(false); }}
                      className={[
                        "flex-1 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer",
                        locale === l
                          ? "bg-white text-black font-semibold"
                          : "border border-[rgba(255,255,255,0.10)] text-[#6E6E73]",
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
                  {isLoggedIn ? tAccount("dashboard") : t("cta")}
                </PremiumButton>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}
