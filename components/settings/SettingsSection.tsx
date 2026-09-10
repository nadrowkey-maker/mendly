/**
 * Une section des paramètres : un panneau, un titre, une explication.
 *
 * Le sous-titre n'est pas décoratif. Sur un écran de réglages, chaque bloc doit
 * dire à quoi il sert avant de montrer ses champs — sinon on lit les champs
 * d'abord et on devine l'intention après, ce qui produit exactement les
 * modifications faites par erreur.
 */
interface SettingsSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Rouge : la zone de suppression. */
  danger?: boolean;
  /** Glyphe posé devant le titre. */
  icon?: React.ReactNode;
}

export function SettingsSection({
  title,
  subtitle,
  children,
  danger,
  icon,
}: SettingsSectionProps) {
  return (
    <section
      className={[
        "rounded-2xl border p-5 md:p-7",
        danger ? "border-red-500/22 bg-red-500/4" : "border-(--panel-line) bg-white/2",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2
          className={[
            "text-[15px] font-bold tracking-tight",
            danger ? "text-red-300" : "text-white",
          ].join(" ")}
        >
          {title}
        </h2>
      </div>
      <p className="mt-1 mb-6 text-[12.5px] text-white/40">{subtitle}</p>
      {children}
    </section>
  );
}
