"use client";

/**
 * Un choix unique, présenté en pilules.
 *
 * Les trois questions du profil — ancienneté, expertise, temps disponible —
 * partageaient le même bloc de classes recopié trois fois. Recopié, donc
 * divergent : deux d'entre eux avaient déjà des grilles différentes pour le
 * même nombre d'options.
 *
 * La sélection est un renversement complet du fond, pas une bordure colorée.
 * Une bordure d'accent sur fond sombre se voit mal en lumière du jour, et sur
 * un réglage qu'on modifie rarement, ne pas savoir ce qui est actif est le
 * seul vrai défaut possible.
 */
interface ChoiceGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  /** Traduit une option en libellé affichable. */
  render: (option: T) => string;
  disabled?: boolean;
  columns?: 2 | 3;
}

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
  disabled,
  columns = 3,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[12px] font-semibold text-white/45">{label}</legend>
      <div
        className={[
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3",
        ].join(" ")}
      >
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              disabled={disabled}
              className={[
                "cursor-pointer rounded-full px-3 py-2.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "bg-white text-(--ink)"
                  : "bg-white/6 text-white/55 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {render(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
