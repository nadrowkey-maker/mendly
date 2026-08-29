"use client";

/**
 * Un champ de formulaire d'authentification.
 *
 * Étiquette en monospace espacé — le même traitement que la télémétrie de la
 * console produit, ce qui rattache les formulaires au reste du système au lieu
 * d'en faire des îlots.
 *
 * L'anneau de focus est explicite et visible : ces écrans se remplissent
 * souvent au clavier, et un focus invisible y est un vrai défaut d'usage, pas
 * un détail d'accessibilité théorique.
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
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)"
      >
        {label}
      </label>
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
        className="w-full rounded-xl border border-(--glass-line) bg-white/3 px-4 py-3 text-white transition-colors placeholder:text-(--text-muted) focus:border-(--accent-primary) focus:outline-2 focus:outline-offset-1 focus:outline-(--accent-glow) disabled:opacity-50"
      />
    </div>
  );
}
