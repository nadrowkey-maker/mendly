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

### Two grounds, one system

The site is **light**. The workspace is **dark**. This is deliberate and it is
the first thing to understand before touching anything visual.

The landing is read once, often on a phone, sometimes outdoors: it has to hold
up in daylight. The workspace is stared at for hours: it has to tire the eye as
little as possible. One charter for both would serve one of them badly. What
carries across is not the background — it is the type, the accent, the shapes
and the one signature device.

### The signature device: the grainy gradient

`components/ui/GrainGradient.tsx`. Soft colour fields with fine film grain,
**computed in the browser, never a video or an image file**. It is the single
most recognisable element of the identity. Rules:

1. It is **generated**. No `.mp4`, no `.webp` of a gradient, and never an asset
   lifted from another site. It costs a few kilobytes of code instead of
   megabytes of asset, scales to any size, and belongs to the product.
2. It renders in **two layers**: the gradient at quarter resolution (blurred by
   nature, so nobody sees the upscale) and the grain at 1:1 on top. Putting the
   grain in the same canvas stretches it ×4 and turns the material into TV
   static. This was tried; it looked cheap.
3. The **colorway carries meaning**: `azure` for the product, `signal` (amber)
   for internal contradiction, `verdict` (green) for a decision reached, `ash`
   when the content on top must win, `dusk` for dark panels.
4. Grain stays subtle. Past roughly `grain={0.6}` it stops breaking the banding
   it exists to break and becomes the subject.

The **ribbon** (`components/ui/Ribbon.tsx`) is the second generated graphic:
the wave across the top of the landing. Same rule — computed, never a file.

### The pill is the only button

`components/ui/Pill.tsx`, four tones, and the tone names the **ground it sits
on**, never an abstract level of importance:

- `ink` — primary action on a light ground
- `paper` — secondary action on a light ground
- `light` — primary action on a dark ground
- `ghost` — quiet action, either ground

One radius, one height scale. A second button shape is what makes an interface
start to feel assembled from parts.

### The workspace is panels on a floor

The sidebar is a rounded panel with a margin all around it; the work area is
the floor itself, with no panel of its own. That margin is what makes it read
as an object rather than a screen edge, and giving the work area its own panel
puts two near-identical values side by side — at which point it reads as a file
explorer.

Nav entries are grouped under small section labels. The active entry is a
filled pill, never a coloured border.

### Typography
- Display + body: **Manrope** via `next/font`. Weight 300 for the landing
  display (`.display`), 600/700 for workspace headings.
  The landing whispers, the workspace states. Do not swap them: a thin heading
  in a tool you use daily becomes decoration you stop reading.
- Technical/telemetry: **JetBrains Mono** — counters, timestamps, small caps
  labels.
- Geist is banned: Vercel's font has become the AI-startup uniform.

### Colour tokens (use these CSS vars, never hardcode)
```css
/* Light — landing, marketing, legal */
--paper: #FBFAF8        /* warm off-white, never #FFF */
--paper-raised: #F3F1ED /* cards, insets */
--paper-line: rgba(14,14,15,0.09)
--ink: #0E0E0F          /* text black, never #000 */
--ink-soft: #55555B
--ink-muted: #8B8B92

/* Dark — the workspace */
--shell: #0A0A0B        /* the floor */
--panel: #161617        /* panels resting on it */
--panel-raised: #1E1E20 /* hover, active */
--panel-line: rgba(255,255,255,0.07)

/* Shared */
--accent-primary: #3AA8FF   /* azure — the only accent */
--accent-glow: #8FD4FF
--signal: #FFB454           /* internal contradiction ONLY */
```

Two rules survive from every previous charter and still hold:
**the accent never touches running text**, and **there is one accent hue**.
Amber is the single exception and is reserved for the moment Mendly
contradicts itself. Used anywhere else it stops meaning anything.

### The product is shown live, never photographed

The landing shows the **real interface, running**, not a picture of it.

The first attempt used PNG captures of the workspace. They failed, and the
reason is worth keeping: the problem was never resolution. A 1440 px workspace
displayed in a 470 px frame renders its 13 px text at 4 px. No amount of
sharpness fixes that — you have to stop showing everything at once.

Two devices replace them, both rendering real components with the fictional
project in `components/preview/fixtures.ts`:

1. **`ProductStage`** — the whole workspace in DOM at its true size, with a
   camera that pans and zooms to the region being discussed and a pointer that
   moves and clicks. Text stays vector, so it is sharp at any zoom; the product
   shown is the product shipped; and there is no file to load. Scripts live
   next to the stage (`ConversationDemo`), one step per phase of the scene.
2. **`DemoCard`** — a fragment of the interface at 1:1, floating on a grainy
   panel. Used in the feature rows. This is what the reference does in its own
   panels, and it is why the reference is legible.

Rules: both pause when off-screen and when `prefers-reduced-motion` is set;
both reset `text-white` and `text-left` on their root, because a fragment of
the app must inherit nothing from the page that hosts it; never put a real
account in either.

Camera framing is arithmetic, not taste. At scale *s* the field is
`1280/s × 800/s`; check that the text column (x 392→1160) and the header
(y 0→130) still fall inside before committing a value. A demo that clips its
own sentences demonstrates nothing.

### The orb is the face of Mendly

`components/ui/MendlyOrb.tsx` — a canvas sphere carrying the grainy-gradient
material, the single representation of the entity. It replaced the conic
multicolour ring and the per-role coloured pills: a counsel that speaks with
one voice cannot have eight avatars in eight colours.

It has two states and one path between them, interpolated frame by frame —
never switched. At rest the material drifts at 12 fps; while Mendly writes it
runs three times faster, brightens, and the halo comes up. `ORB_COLORS` is
exported because `SpeakingBar`, the light along the top edge of the workspace,
must use exactly those hues. Two near-but-different palettes on one screen do
not read as two elements, they read as a defect.

### Banned
Belonging to earlier charters, all removed: the full-screen particle field
(`EntityField`), aurora gradients and multi-accent text, meteors, shooting
stars, glow pulses on CTAs, magnetic buttons, the pill-with-pellet button,
liquid-glass panels on the landing, `#000000` as a ground, the multicolour
`aurora-cloud`/`AIAura` rings, per-agent colour palettes, and static PNG
screenshots of the product.

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
  home/          → the landing page, light ground (PaperNav, Hero, Features…)
  app/           → the workspace shell (AppShell, AppSidebar, AppHeader…)
  auth/          → the split-panel sign-in screens
  onboarding/    → the five-step welcome
  settings/      → the settings screens
  preview/       → the demo project fixtures and the design-QA scenes
  sections/      → editorial pages (manifesto, contact, security…)
  ui/            → atomic UI (Pill, GrainGradient, Ribbon…)
  layout/        → Nav + Footer for the dark editorial pages
lib/
  utils.ts       → cn, helpers
  ai/agents/mendly.ts → the single entity (agents.ts = legacy 8-agent data)
  constants.ts   → shared constants

## INTERACTION RULES

### When adding a new section
1. Landing sections go in `components/home/`, workspace screens in
   `components/app/`. `components/sections/` is now only for the editorial
   pages (manifesto, contact, security).
2. Export as a named export: `export function Features() { ... }`
3. Use translations via `useTranslations` — the landing namespace is `home`
4. Mobile-responsive by default
5. Animate on scroll entrance (Framer Motion's `whileInView`), restrained

### When using 21st.dev components
- **FIRST**: Read `@21ST-COMPONENTS-MENDLY.md` to check if there's a pre-approved component for the section/feature you're building.
- If yes, use that component's URL via `/ui` or `npx shadcn@latest add <url>`.
- If no pre-approved component fits, use `/ui` to search for alternatives, but prioritize the approved list.
- **Always customize** the generated component to the tokens above (never leave `bg-blue-500`; use `--ink`/`--paper` on the landing and `--panel`/`--shell` in the workspace, and never introduce a second accent hue).
- **Replace its buttons with `Pill`.** A generated component always ships its
  own button shape, and that is exactly how an interface starts looking
  assembled from parts.
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
Never hand-roll one. There is a single button component and four tones:

```tsx
import { PillLink, PillAction } from "@/components/ui/Pill";

// Primary action on the light landing
<PillLink href="/signup" tone="ink" size="md">Essayer gratuitement</PillLink>

// Primary action inside the dark workspace
<PillAction tone="light" size="lg" block onClick={save}>Enregistrer</PillAction>
```

### Good landing section
```tsx
"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function Method() {
  const t = useTranslations("home.method");

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl"
      >
        {/* Small caps label, mono, muted — never the accent on running text */}
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
          {t("label")}
        </p>
        <h2 className="display mt-3 text-[28px] text-(--ink) md:text-[38px]">
          {t("title")}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-(--ink-soft)">
          {t("sub")}
        </p>
      </motion.div>
    </section>
  );
}
```

### Good workspace screen
```tsx
<AppShell groups={groups} usageUsed={used} usageLimit={limit}
          userPlan={plan} userEmail={email}>
  <AppHeader title={t("title")} subtitle={t("subtitle")} />
  <div className="px-6 py-8 md:px-10">{/* … */}</div>
</AppShell>
```
