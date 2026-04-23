# MENDLY — Claude Instructions

You are helping build Mendly, a landing page for an AI SaaS product that gives solo founders a virtual team of 8 AI executives (CEO, CTO, CMO, CPO, CDO, CFO, DEV, CCO).

## CRITICAL CONTEXT

- **Audience**: Indie hackers / solo founders (tech-savvy, pro, no-bullshit)
- **Positioning**: Not "AI that does" — "A TEAM that collaborates"
- **Differentiation**: We compete against ChatGPT/Lovable/Bolt by being a structured team experience
- **Tone**: Confident, direct, a bit editorial. Never corporate. Never fluffy.
- **Languages**: EN (default) + FR (full parity, not just translation — tutoiement in French)

## DESIGN PRINCIPLES

### Visual direction: "Cosmic Tech"
- Deep space black background (`#05030E`)
- Violet/cyan accents (`#8B5CF6`, `#06B6D4`, `#A78BFA`, `#F0ABFC`)
- Subtle aurora gradients that breathe
- Noise texture overlay (2-3% opacity) for depth
- Grid background with radial mask
- Generous whitespace — spacing IS design
- Never decorative, always meaningful

### Typography
- Display/Headlines: **Geist** (Vercel's font, via `next/font`)
- Body: **Geist**
- Monospace/technical: **Geist Mono**
- Editorial accents (manifesto, promise sections only): **Fraunces** italic

### Color tokens (use these CSS vars, never hardcode)
```css
--bg-primary: #05030E      /* space black */
--bg-secondary: #0A0820    /* slightly lifted */
--surface: #14102A         /* cards */
--accent-primary: #8B5CF6  /* violet */
--accent-glow: #A78BFA     /* lighter violet */
--accent-hot: #06B6D4      /* cyan */
--accent-warm: #F0ABFC     /* fuchsia highlight */
--text-primary: #F5F3FF
--text-muted: #A1A1AA
--text-dim: #71717A
--border: rgba(139, 92, 246, 0.15)
```

### Signature effects
1. **Aurora background** — animated violet/cyan gradient
2. **Magnetic buttons** — slightly follow mouse
3. **3D tilt on cards** — subtle rotateX/Y on hover
4. **Smooth scroll** via Lenis
5. **Scroll-triggered animations** via Framer Motion / GSAP
6. **Text generate effect** on hero headlines
7. **Meteors / shooting stars** on sections with impact
8. **Glow pulses** on primary CTAs

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
  agents.ts      → the 8 agents data
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
- **Always customize** the generated component to match Mendly's Cosmic Tech palette (never leave `bg-blue-500`, always use `bg-[var(--accent-primary)]`).
- **Always respect section ambiance**: each section has its own visual mood (see `21ST-COMPONENTS-MENDLY.md`).
- Install via `npx shadcn@latest add <component-url>` when prompted.

### When writing copy
- **ALWAYS read `@COPYWRITING-MENDLY.md`** for the approved copywriting (humanly readable reference)
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
