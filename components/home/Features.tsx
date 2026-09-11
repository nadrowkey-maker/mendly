"use client";

import { useTranslations } from "next-intl";
import { FeatureRow } from "@/components/home/FeatureRow";
import { ContradictionCard } from "@/components/home/ContradictionCard";
import { RoomCard } from "@/components/home/RoomCard";
import { NightCard } from "@/components/home/NightCard";

/**
 * Les trois rangées de démonstration.
 *
 * Elles suivent l'ordre d'usage réel et non l'ordre d'importance : on
 * commence par contester, on passe en salle quand la question l'exige, et le
 * travail continue la nuit. Ranger la nuit en premier ferait une promesse de
 * science-fiction avant d'avoir montré la conversation, qui est ce que le
 * fondateur touche en premier.
 */
export function Features() {
  const t = useTranslations("home.features");

  return (
    <section id="methode" className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="max-w-xl">
        <h2 className="display text-[28px] text-(--ink) md:text-[38px]">{t("title")}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-(--ink-soft)">{t("sub")}</p>
      </div>

      <div className="mt-16 space-y-24 md:mt-20 md:space-y-32">
        <FeatureRow
          eyebrow={t("contradiction.eyebrow")}
          title={t("contradiction.title")}
          items={t.raw("contradiction.items") as string[]}
          visual={<ContradictionCard />}
          colorway="azure"
          seed={21}
        />
        <FeatureRow
          eyebrow={t("room.eyebrow")}
          title={t("room.title")}
          items={t.raw("room.items") as string[]}
          visual={<RoomCard />}
          colorway="verdict"
          seed={34}
          flipped
        />
        <FeatureRow
          eyebrow={t("night.eyebrow")}
          title={t("night.title")}
          items={t.raw("night.items") as string[]}
          visual={<NightCard />}
          colorway="signal"
          seed={47}
        />
      </div>
    </section>
  );
}
