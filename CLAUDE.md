# MENDLY — Claude Instructions

You are helping build Mendly, an AI SaaS product for solo founders.

**Mendly is ONE entity, not a team of 8 agents.** The 8-executive product was
replaced in August 2026 (`lib/ai/agents/mendly.ts`). Mendly carries every angle
a leadership team would have — finance, growth, tech, product, strategy, data,
execution, communication — but speaks as a single being. It never says "my
team", "the agents" or "the CFO thinks". Its signature mechanic is exposing its
own internal contradiction rather than smoothing it over.

A per-project team of specialists still exists, but only inside the **Salle de
réunion** (`lib/ai/team/assign-team.ts`), where it can be convened for a debate
— and it works autonomously on a schedule (`app/api/cron/team-sessions`).

Any copy or UI that presents Mendly as a team of eight is obsolete.

## CRITICAL CONTEXT

- **Audience**: Indie hackers / solo founders (tech-savvy, pro, no-bullshit)
- **Positioning**: Not "AI that assists" — a counsel that CONTRADICTS you. Mendly
  is the one voice that dares tell a solo founder they are wrong.
- **Differentiation**: ChatGPT agrees with you. Mendly argues, exposes its own
  internal contradiction, and decides — and it keeps working while you are away.
- **Tone**: Confident, direct, a bit editorial. Never corporate. Never fluffy.
- **Languages**: EN (default) + FR (full parity, not just translation — tutoiement in French)

## DESIGN PRINCIPLES

### Visual direction: "Contrôle Mission"

Dark technological, glassmorphism, the feel of a mission control console.
Reference: the VEXEL landing page. **The category alone is not the point** —
"dark with glows" is also what every generated AI landing looks like. What
separates this system from that is a small number of execution rules, and they
are non-negotiable:

1. **The accent NEVER touches running text.** Azure lives in light, halos,
   graphics and data. Headings stay white. Coloured headline text is the single
   most recognisable tell of a generated page.
2. **The ground is `#000000`.** Not a violet-black, not charcoal. A tinted black
   dates the page on its own.
3. **One accent hue only.** The multi-accent gradient (violet + cyan + fuchsia)
   is the number-one marker of the AI template. The previous charter mandated
   four accents — that was the problem, not the solution.
4. **Generative graphics are computed, never faked.** Particle structures are
   real-time canvas/WebGL. A CSS gradient imitating one is spotted instantly.
5. **No emoji in UI chrome.** Markers are typographic: a rule, a mono label.

The amber signal is the one exception to rule 3, and it is reserved for a single
use: the moment Mendly contradicts itself. Used anywhere else it stops meaning
anything.

### Typography
- Display + body: **Manrope** via `next/font` — weight **200** for large
  display, 400/500 for text. The weight contrast does the work of a second
  family; that thin-and-huge headline is central to the look.
- Technical/telemetry: **JetBrains Mono** — counters, timestamps, labels.
- Headlines are sentence case, tight tracking (`-0.03em` to `-0.038em`), and end
  with a full stop. The punctuation closes the sentence and gives it poise.
- Geist is banned: Vercel's font has become the AI-startup uniform.

### Color tokens (use these CSS vars, never hardcode)
```css
--bg-base: #000000          /* absolute black, the ground */
--bg-raised: #06080B        /* sections, panels */
--bg-overlay: #0B0F14       /* menus, popovers */
--glass: rgba(255,255,255,0.045)
--glass-line: rgba(255,255,255,0.09)
--glass-hi: rgba(255,255,255,0.17)   /* top edge highlight */
--accent-primary: #3AA8FF   /* azure — the only accent */
--accent-glow: #8FD4FF
--accent-halo: rgba(58,168,255,0.28)
--signal: #FFB454           /* internal contradiction ONLY */
--text-primary: #FFFFFF
--text-secondary: #9AA4AE
--text-muted: #5D666F
```

### Signature effects
1. **The entity** — one fixed full-screen particle field that morphs between
   states as you scroll (torus, sphere, wave, helix). The same points
   reorganise; nothing appears or disappears.
2. **Liquid glass** — `blur(20px) saturate(140%)`, a 9% white border, and a
   luminous hairline on the **top edge**. That hairline is what separates Apple
   glass from a plain translucent panel; without it the surface reads cheap.
3. **The pill + pellet button** — a circular badge holding an arrow, inside the
   pill, always inverting the button's own background. This is the detail people
   recognise before they read the logo.
4. **3D-tilted product console** — `perspective` + `rotateX(9deg)`, real UI
   inside, never an abstract illustration.
5. **Scroll-triggered reveals** via Framer Motion, restrained.

Banned, they belong to the old charter: aurora gradients, meteors, shooting
stars, glow pulses on CTAs, noise texture, magnetic buttons.

## CODE RULES (non-negotiable)

### TypeScript
- **Strict mode always**. No `any` unless impossible otherwise.
- All component props typed with interfaces or types
- Discriminated unions over enums when possible

### React / Next.js
- Server components by default. Only use `"use client"` when needed (interactivity, hooks).
- Never use `localStorage` or `sessionStorage` — use state or server props
- All routes under `app/[locale]/...` (not `app/` directly)
- Use `next/image` for images, never `<img>`
- Use `Link` from `@/i18n/routing` (not next/link directly) — for locale-aware routing
- Use `useTranslations('namespace')` from `next-intl` for all text

### Tailwind
- **Never write custom CSS** in components — Tailwind only
- Use CSS variables defined in `globals.css` (e.g. `bg-[var(--bg-primary)]`)
- Mobile-first: base classes are mobile, use `md:` and `lg:` for larger
- Avoid arbitrary values unless truly needed (`p-[17px]` is bad, `p-4` is good)

### Components
- One component per file
- Named exports preferred over default (except for pages)
- Props destructured in signature
- Keep components under 200 lines; split if larger

### File structure
components/
  sections/      → big landing page sections (Hero, Problem, etc.)
  ui/            → shadcn + custom atomic UI
  3d/            → Three.js / R3F scenes
  layout/        → Nav, Footer
lib/
  utils.ts       → cn, helpers
  ai/agents/mendly.ts → the single entity (agents.ts = legacy 8-agent data)
  constants.ts   → shared constants

## INTERACTION RULES

### When adding a new section
1. Always create it under `components/sections/` as its own file
2. Export as named export: `export function HeroSection() { ... }`
3. Use translations via `useTranslations`
4. Mobile-responsive by default
5. Animate on scroll entrance (Framer Motion's `whileInView`)

### When using 21st.dev components
- **FIRST**: Read `@21ST-COMPONENTS-MENDLY.md` to check if there's a pre-approved component for the section/feature you're building.
- If yes, use that component's URL via `/ui` or `npx shadcn@latest add <url>`.
- If no pre-approved component fits, use `/ui` to search for alternatives, but prioritize the approved list.
- **Always customize** the generated component to match Mendly's "Contrôle Mission" system (never leave `bg-blue-500`, always use `bg-[var(--accent-primary)]`, and never introduce a second accent hue).
- **Always respect section ambiance**: each section has its own visual mood (see `21ST-COMPONENTS-MENDLY.md`).
- Install via `npx shadcn@latest add <component-url>` when prompted.

### When writing copy
- ⚠️ **`COPYWRITING-MENDLY.md` is OBSOLETE.** It still sells the 8-agent product
  and the old landing. Do not copy from it until it has been rewritten.
- **ALWAYS use `useTranslations('namespace')` from next-intl** — NEVER hardcode strings
- All translation keys are already defined in `messages/en.json` and `messages/fr.json` (253 keys, 13 namespaces)
- Namespaces: `nav`, `hero`, `problem`, `promise`, `howItWorks`, `team`, `action`, `deliverables`, `comparison`, `pricing`, `trust`, `finalCta`, `footer`
- For each section you code, use the corresponding namespace (e.g. `useTranslations('problem')` for The Problem section)
- If you need a NEW key that doesn't exist, add it to BOTH `en.json` and `fr.json` (never only one)
- **NEVER invent copy** that's not in `COPYWRITING-MENDLY.md` — if something is missing, ask the user

### Forbidden
- `localStorage` / `sessionStorage` / `cookies` directly
- Inline styles (`style={{...}}`) — Tailwind only
- `<img>` tags — use `next/image`
- `any` type in TypeScript
- Default exports from components (except pages)
- Hardcoded colors outside the design tokens
- English text in French files or vice-versa
- Emojis in H1/H2 headlines (OK in body, cards, CTAs)
- Corporate marketing speak ("revolutionary", "game-changing", "next-gen")

### Required
- Mobile-first responsive
- Keyboard accessible (tab order, focus rings)
- `aria-labels` on icon-only buttons
- `alt` on all images (empty string for decorative)
- Semantic HTML (`<section>`, `<article>`, `<nav>`)
- Animations respect `prefers-reduced-motion`

## BEFORE YOU CODE

Before writing any component:
1. Read `CLAUDE.md` (this file)
2. Read the relevant section in `COPYWRITING-MENDLY.md` for exact copy
3. Check if a 21st.dev component fits the need — use `/ui` if yes
4. Think mobile-first, then enhance for desktop
5. Animate purposefully (every animation should mean something)

## EXAMPLES OF DONE RIGHT

### Good button
```tsx
<button
  className="px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white font-semibold
             shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]
             transition-shadow duration-300"
>
  Join the waitlist
</button>
```

### Good section wrapper
```tsx
"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center"
      >
        <p className="text-xs tracking-[0.3em] text-[var(--accent-glow)] mb-4">
          {t("eyebrow")}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {t("title")}
        </h2>
      </motion.div>
    </section>
  );
}
```
