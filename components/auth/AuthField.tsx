"use client";

/**
 * Un champ de formulaire d'authentification.
 *
 * Le champ est blanc opaque, pas translucide. Posé sur un dégradé, un champ en
 * verre laisse passer la couleur : la valeur saisie change de contraste selon
 * l'endroit où la tache passe derrière, et sur un mot de passe on ne s'en rend
 * même pas compte. Le blanc plein règle la question une fois pour toutes.
 *
 * L'étiquette est en encre sombre et non en gris clair, pour la même raison :
 * elle doit tenir sur la partie la plus claire comme sur la plus saturée du
 * dégradé.
 */
interface AuthFieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  autoComplete?: string;
  /** Message affiché en regard de l'étiquette, à droite. */
  hint?: string;
}

export function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  disabled,
  autoComplete,
  hint,
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold tracking-tight text-(--ink)">
          {label}
        </label>
        {hint && <span className="text-[12px] text-(--ink)/55">{hint}</span>}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] text-(--ink) shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-shadow placeholder:text-(--ink-muted) focus:outline-2 focus:outline-offset-1 focus:outline-(--accent-primary) disabled:opacity-60"
      />
    </div>
  );
}
