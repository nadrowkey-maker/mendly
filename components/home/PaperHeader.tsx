import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";
import { Reveal } from "@/components/home/Reveal";

/**
 * L'en-tête des pages annexes.
 *
 * Un panneau arrondi portant la matière en lavis, le titre en display fin
 * par-dessus. C'est le traitement de la rangée d'atouts de la page d'accueil,
 * repris tel quel : le visiteur qui arrive d'un lien du pied de page doit
 * reconnaître le site avant d'avoir lu le titre.
 *
 * Le lavis reste sous les quarante pour cent. Au-delà, le contraste du titre
 * se met à dépendre de l'endroit où passe la tache — le défaut exact qu'on a
 * corrigé sur la page d'accueil.
 */
interface PaperHeaderProps {
  /** Petite étiquette au-dessus du titre. */
  eyebrow?: string;
  title: string;
  sub?: string;
  /** Ligne technique sous le texte : date de mise à jour, par exemple. */
  meta?: string;
  colorway?: GrainColorway;
}

export function PaperHeader({ eyebrow, title, sub, meta, colorway = "azure" }: PaperHeaderProps) {
  return (
    <header className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
      <div className="relative overflow-hidden rounded-[28px] bg-(--paper-raised) px-6 py-14 md:px-14 md:py-20">
        <GrainGradient
          colorway={colorway}
          seed={title.length * 7 + 3}
          grain={0.5}
          className="absolute inset-0 size-full opacity-35"
        />

        <Reveal className="relative max-w-2xl">
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
              {eyebrow}
            </p>
          )}
          <h1 className="display mt-3 text-[34px] text-(--ink) md:text-[52px]">{title}</h1>
          {sub && (
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-(--ink-soft)">{sub}</p>
          )}
          {meta && (
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-(--ink-muted)">
              {meta}
            </p>
          )}
        </Reveal>
      </div>
    </header>
  );
}
