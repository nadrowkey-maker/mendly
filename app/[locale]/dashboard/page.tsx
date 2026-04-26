"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-1">
              MENDLY
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("welcome")}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors"
          >
            {t("signOut")}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-10 md:p-16 text-center"
        >
          <div className="text-6xl mb-6" role="img" aria-label="Empty">
            🚀
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t("emptyTitle")}
          </h2>
          <p className="text-(--text-muted) max-w-md mx-auto mb-8">
            {t("emptyBody")}
          </p>

          {email && (
            <p className="text-xs font-mono text-(--text-dim) mb-8">
              {t("loggedInAs")}{" "}
              <span className="text-(--accent-glow)">{email}</span>
            </p>
          )}

          <PremiumButton variant="primary" size="md" disabled>
            {t("createProjectSoon")}
          </PremiumButton>
        </motion.div>
      </div>
    </main>
  );
}