# Phase 4 — Renderer (`apps/renderer`)

> Status: **Completed** · Depends on: Phase 1, 2, 3 · Blocks: Phase 5, 6

## Objective

Build the **renderer** — a local development app that, on `npm run dev`, gives us (and any future
contributor) a live, interactive view of every component in `apx-ds`. It also doubles as the
future public docs site (`apx-ds` or similar) once we're ready to ship.

Critically: **the renderer is not part of the published library**. It lives in `apps/renderer/`,
consumes `apx-ds a workspace dependency, and is built via `pnpm build:preview`.

---

## Why Custom (vs Storybook)?

- Tailored to our exact docs format: `README.md` per component + auto-discovered examples
- Zero magic — readable, ~1000 LoC, easy to extend
- Same stack as the future public site → no migration later
- Live `ThemeProvider` controls (mode/variant/dir) wired into the chrome
- Source code shown is **literally** the example file's content (via raw imports), so docs never drift
  from code

---

## Stack

| Concern          | Choice                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| Framework        | **Next.js 15 (App Router)**                                              |
| Styling          | **Tailwind CSS v4** + the `apx-dsilwind preset (Phase 3)         |
| MDX              | **`next-mdx-remote`** (RSC-compatible)                                   |
| Syntax highlight | **Shiki** (build-time)                                                   |
| Live preview     | Direct React rendering; **Sandpack** added later for editable playground |
| File discovery   | `fs` at build time inside Server Components                              |
| Search           | Local Fuse.js (Phase 4) → Algolia DocSearch (later)                      |

---

## URL / Page Structure

```
/                                  → home (list + grid of all components)
/getting-started                   → MDX page from /content/getting-started.mdx
/theming                           → MDX page explaining theme system
/playground                        → freeform Sandpack playground (Phase 4 → later)
/components                        → all components (same as /)
/components/button                 → Button page
/components/<slug>                 → dynamic
```

Each `/components/<slug>` page renders:

```
┌───────────────────────────────────────────────────────────┐
│ Sidebar      │ <Heading>Button</Heading>                  │
│              │ <Description from README />                │
│  Foundations │                                            │
│  Components  │ ## Examples                                │
│   Button     │ <ExampleBlock for="Basic">                 │
│   …          │   (live preview)                           │
│              │   (source code with copy button)           │
│              │ <ExampleBlock for="Variants">              │
│              │   …                                        │
│              │ ## Props                                    │
│              │ <PropsTable />                              │
│              │ ## Accessibility                            │
│              │ <Section from README />                    │
└───────────────────────────────────────────────────────────┘
```

Top chrome bar contains the **live theme controls**:

- Mode toggle: light / dark / system
- Variant selector: default / rounded / sharp (extensible)
- Direction toggle: LTR / RTL
- Component-level variant override: a select that lets you cycle through that component's variants

These controls drive the _same_ `ThemeProvider` that wraps the preview — flipping them shows real
results immediately. This **is** the visual QA tool.

---

## File Discovery

The renderer reads from `packages/components/src/` at build time. Convention:

```
packages/components/src/
└── Button/
    ├── Button.tsx
    ├── Button.test.tsx
    ├── README.md
    ├── meta.ts             # { name: 'Button', category: 'Inputs', tags: ['form'] }
    └── examples/
        ├── Basic.tsx
        ├── Variants.tsx
        └── WithIcon.tsx
```

Build-time scan logic (`apps/renderer/lib/discover.ts`):

```ts
export async function discoverComponents() {
  const root = path.join(process.cwd(), '../../packages/components/src');
  const dirs = await fs.readdir(root, { withFileTypes: true });
  return Promise.all(
    dirs
      .filter((d) => d.isDirectory())
      .map(async (d) => ({
        slug: kebab(d.name),
        name: d.name,
        meta: await loadMeta(d.name),
        readme: await fs.readFile(path.join(root, d.name, 'README.md'), 'utf8'),
        examples: await loadExamples(d.name),
      })),
  );
}
```

`loadExamples`:

- Reads every `.tsx` file in `examples/`
- For each: loads both the **rendered component** (dynamic import) and the **raw source string**
- Renders `<ExampleBlock preview={...} code={source} />`

---

## Components Inside the Renderer

The renderer itself is built from a small set of internal-only React components:

```
apps/renderer/src/
├── app/
│   ├── layout.tsx              # ThemeProvider, sidebar, chrome
│   ├── page.tsx                # home
│   ├── components/
│   │   ├── page.tsx            # component grid
│   │   └── [slug]/page.tsx     # individual component page
│   └── (docs)/
│       ├── getting-started/page.mdx
│       └── theming/page.mdx
├── components/
│   ├── chrome/
│   │   ├── Chrome.tsx          # top bar + sidebar
│   │   ├── ModeToggle.tsx
│   │   ├── VariantSelect.tsx
│   │   ├── DirectionToggle.tsx
│   │   └── Sidebar.tsx
│   ├── docs/
│   │   ├── ExampleBlock.tsx    # preview + code tabs/stacked
│   │   ├── CodeBlock.tsx       # Shiki-rendered, copyable
│   │   ├── PropsTable.tsx      # auto-generated from TS
│   │   ├── ComponentCard.tsx   # used on home/grid
│   │   └── Mdx.tsx             # MDX renderer with custom components
│   └── primitives/
│       └── …                   # local primitives — does NOT use apx-dself for chrome
│                                # (we don't want the chrome to break when DS is mid-development)
├── lib/
│   ├── discover.ts
│   ├── shiki.ts                # singleton highlighter
│   ├── propsTable.ts           # react-docgen-typescript wrapper
│   └── routes.ts
└── content/
    ├── getting-started.mdx
    └── theming.mdx
```

**Important architectural rule**: the renderer's _chrome_ (sidebar, top bar, controls) is built
with **plain Tailwind / Radix primitives**, NOT with `apx-dshis way, if a DS change breaks
something, the docs site itself still renders so we can debug.

Only the **preview area** uses `apx-ds

---

## Theme Controls (the visual QA bar)

Wired into the same `<ThemeProvider>` that wraps the preview:

```tsx
function Chrome({ children }) {
  return (
    <ThemeProvider defaultMode="system" defaultDir="ltr" defaultVariant="default">
      <div className="grid grid-cols-[260px_1fr] min-h-screen">
        <Sidebar />
        <div>
          <TopBar>
            <ModeToggle />
            <VariantSelect options={['default', 'rounded', 'sharp']} />
            <DirectionToggle />
          </TopBar>
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
```

`ModeToggle`, `VariantSelect`, `DirectionToggle` each call the corresponding setter from
`useMode()` / `useVariant()` / `useDirection()` — the same hooks consumers will use.

---

## Component Examples Convention

Every example is a **real, runnable React component**:

```tsx
// packages/components/src/Button/examples/Basic.tsx
import { Button } from 'apx-ds';
export default function Basic() {
  return <Button>Click me</Button>;
}
```

The renderer:

1. Dynamically imports `Basic` and renders it inside `<ExampleBlock>`
2. Reads `Basic.tsx` as a raw string via Next's `?raw` import or `fs.readFile`
3. Pipes the string through Shiki for syntax-highlighted code below the preview
4. Adds a "Copy code" button + an "Open in CodeSandbox" link (later)

`<ExampleBlock>` UI:

- Tabs: **Preview** / **Code** (or stacked layout in larger viewports)
- Preview has a checkered background (or theme bg) to show transparency vs solid colors
- A small toolbar inside the preview lets you toggle the **component-level variant** if it has one
- "Open Full" button → puts the example fullscreen (great for screenshotting)

---

## Props Table (Auto-Generated)

At build time, walk `Button.tsx` with `react-docgen-typescript` to extract:

- Prop name, type (formatted), default value, description (from JSDoc), required flag

Renders as a clean table. JSDoc `@deprecated` / `@experimental` tags get badges.

DRY: one `PropsTable` component, used for every page.

---

## MDX Setup

`README.md` files use MDX so they can embed live components. Custom MDX components:

```tsx
const mdxComponents = {
  h1: Heading,
  h2: Heading,
  code: InlineCode,
  pre: CodeBlock, // Shiki-rendered
  ExampleBlock, // available inside MDX directly
  Callout, // info/warning/danger
  PropsTable, // can be embedded with <PropsTable for="Button" />
};
```

So a component's README can do:

```mdx
# Button

Buttons trigger actions.

<Callout type="info">Buttons should always have an accessible name.</Callout>

## Anatomy

A button is a single interactive element with a label.

<ExampleBlock for="Basic" />

## Props

<PropsTable for="Button" />
```

---

## Theming the Renderer

The renderer ships its own minimal Tailwind config that imports the `apx-dseset, so any DS
class works inside docs (for showing tokens, etc.). But chrome styles use their own scoped namespace
to avoid clashing.

```ts
// apps/renderer/tailwind.config.ts
import { apxTailwindPreset } from 'apx-dslwind-preset';

export default {
  presets: [apxTailwindPreset],
  content: ['./src/**/*.{ts,tsx,mdx}', '../../packages/components/src/**/*.{ts,tsx,md,mdx}'],
};
```

---

## Build & Dev Scripts

In `apps/renderer/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start"
  }
}
```

At the workspace root:

- `pnpm dev` → `turbo run dev --filter=renderer` (also runs DS packages in `tsup --watch` via dep graph)
- `pnpm build:preview` → `turbo run build --filter=renderer`
- The renderer is configured with `transpilePackages: ['apx-ds@apx-apx-ds HMR
  works through the workspace symlinks.

---

## File-Level Tasks (Ordered)

1. [ ] Scaffold Next.js 15 app inside `apps/renderer` (App Router, TypeScript, Tailwind)
2. [ ] Install: `next-mdx-remote`, `shiki`, `react-docgen-typescript`, `fuse.js`, `clsx`,
       `@radix-ui/react-tabs`, `@radix-ui/react-select` (for chrome only)
3. [ ] Configure Tailwind with `apxTailwindPreset`
4. [ ] Configure `transpilePackages` in `next.config.mjs`
5. [ ] Build `Chrome`, `Sidebar`, `TopBar`
6. [ ] Build `ModeToggle`, `VariantSelect`, `DirectionToggle` — wire to theme hooks
7. [ ] Build `discover.ts` (fs scan of packages/components/src)
8. [ ] Build `loadExamples()` (raw + dynamic)
9. [ ] Build `<ExampleBlock>` with Preview/Code tabs, copy button, variant toggle
10. [ ] Build `<CodeBlock>` using Shiki (singleton, GitHub Dark + Light themes)
11. [ ] Build `<PropsTable>` using `react-docgen-typescript`
12. [ ] Build `<Mdx>` renderer with custom components map
13. [ ] Build home page (`/`) — component grid with cards
14. [ ] Build dynamic `/components/[slug]/page.tsx`
15. [ ] Add temporary `placeholder` component folder so the renderer has something to display
        (will be removed in Phase 5 when Button arrives)
16. [ ] Add `/getting-started` and `/theming` MDX pages
17. [ ] Implement local search (Fuse.js) over component names + tags
18. [ ] Verify `pnpm dev` works end-to-end: edit a DS file → renderer hot-reloads
19. [ ] Verify `pnpm build:preview` produces a static `out/` (`next export`-able) build
20. [ ] Verify theme controls actually change rendered components (use temporary placeholder)
21. [ ] Verify RTL toggle flips component layout

---

## Acceptance Criteria

- [ ] `pnpm dev` starts the renderer at `localhost:3000` in under 5s on a warm cache
- [ ] Editing a file in `packages/components/src/<X>/` triggers HMR in the renderer
- [ ] Adding a new folder under `packages/components/src/` makes it appear in the sidebar on next
      reload — **zero renderer code changes required**
- [ ] Theme controls (mode/variant/dir) work and reflect in the preview region
- [ ] `<ExampleBlock>` shows preview + correctly-highlighted source from the actual example file
- [ ] `<PropsTable>` correctly reads JSDoc + TS types
- [ ] Renderer chrome works even when DS components fail to compile (error boundary in preview area)
- [ ] `pnpm build:preview` succeeds and the static build runs (`next start`) identically to dev

---

## DRY Self-Check

- One `discover.ts` for file discovery, one `<ExampleBlock>` for examples, one `<CodeBlock>` for
  syntax highlighting, one `<PropsTable>` for props
- Renderer chrome uses local primitives, NOT `apx-dsy design (decoupling)
- All theme controls call DS hooks — no duplicated theme state in the renderer
- MDX custom components defined in one map, reused on every page

---

## Risks & Mitigations

| Risk                                           | Mitigation                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Next.js HMR doesn't see changes in `packages/` | `transpilePackages` + tsup watch + explicit `content` paths in Tailwind |
| `react-docgen-typescript` slow on cold start   | Cache per-build to `.next/cache`                                        |
| MDX RSC complications                          | Use `next-mdx-remote/rsc` — well-supported in App Router                |
| Renderer breaks when DS breaks                 | Error boundary around preview region; chrome doesn't use DS             |
| Bundle size of Shiki                           | Use the lite build + just two themes                                    |

---

## Future Enhancements (Out of Scope for Phase 4)

- Sandpack editable playground per example
- Algolia DocSearch
- Versioned docs (multiple DS versions)
- Visual regression integration (Argos/Chromatic)
- A11y panel showing axe-core results per example
- Figma deep links from each component
- A `pnpm new-component <Name>` codegen script (would scaffold folder + README + examples)
- Public deploy to Vercel

---

## When This Phase Is Complete

1. Move this file to `plans/completed/04-renderer.md`.
2. Append `## Outcome` with: screenshots of the renderer running, final file count, list of MDX
   custom components, and any deferred features.
3. Open `plans/pending/05-button.md`.

---

## Outcome

The renderer is live at `apps/renderer` and consumes the workspace `apx-dsckage. It
discovers components from `packages/components/src/`, renders their `README.mdx`, runs every
example file inside an isolated preview frame, and exposes mode / variant / direction controls
that drive the same `<ThemeProvider>` real consumers will use.

### Shipped surface

**Discovery & libs (`apps/renderer/src/lib/`)**

- `paths.ts` — resolves workspace root, components source dir, and renderer content dir.
- `slug.ts` — `toKebab` / `fromKebab` helpers for component slugs.
- `discover.ts` — `discoverComponents()`, `findComponentBySlug()`, parses `meta.ts` literals,
  reads `README.mdx` / `README.md`, enumerates `examples/*.tsx` with raw source strings.
- `shiki.ts` — singleton highlighter pre-loaded with `github-light` + `github-dark` themes and
  `tsx/ts/jsx/js/css/mdx/md/bash/json` langs. Returns both HTML strings; CSS hides the inactive
  theme based on `<html data-mode>`.
- `propsTable.ts` — `react-docgen-typescript` parser cached as a singleton, filters out DOM /
  intrinsic props, surfaces `@deprecated` / `@experimental` JSDoc tags.

**Chrome (`apps/renderer/src/components/chrome/`)** — all built with local Tailwind + Radix only;
no `apx-dsports so the chrome stays usable if the DS breaks.

- `Chrome.tsx` — server component, loads the component index, lays out sidebar + content grid.
- `Sidebar.tsx` — client component, foundation links + categorized component list + Fuse.js
  search box (keys: `displayName`, `tags`, `category`).
- `TopBar.tsx` — server component shell that mounts the three theme controls.
- `ModeToggle.tsx` — radiogroup of light / system / dark, wires to `useMode()`.
- `VariantSelect.tsx` — Radix select bound to `useVariant()` (default / rounded / sharp).
- `DirectionToggle.tsx` — LTR / RTL toggle bound to `useThemeDirection()`.

**Docs primitives (`apps/renderer/src/components/docs/`)**

- `ExampleBlock.tsx` — server component composing `PreviewFrame` + `PreviewLoader` + `CodeBlock`.
- `PreviewFrame.tsx` — dotted background container that makes transparent components visible.
- `PreviewLoader.tsx` — client component, dynamically imports
  `@apx-dsponents/src/<DirName>/examples/<ExampleId>.tsx` via webpack's context module,
  wrapped in `PreviewBoundary`.
- `ErrorBoundary.tsx` — `PreviewBoundary` class component; chrome-styled fallback when a preview
  throws.
- `CodeBlock.tsx` — Shiki-rendered light/dark HTML pair, file-name pill, `CopyButton`.
- `CopyButton.tsx` — client component using `navigator.clipboard.writeText`.
- `PropsTable.tsx` — server component, reads from `extractProps()`, sorts required-first, shows
  deprecation / experimental badges.
- `ComponentCard.tsx` — grid card for home / `/components`.
- `Callout.tsx` — info / warning / danger / success boxes used inside MDX.
- `Mdx.tsx` — `next-mdx-remote/rsc` renderer with custom components map:
  - HTML overrides: `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `code`, `pre` (Shiki).
  - DS custom blocks: `Callout`, `ExampleBlock` (`for="<id>"`), `PropsTable` (no args).

**Local primitives (`apps/renderer/src/components/primitives/`)**

- `cn.ts` — local clsx-only `cn` (no tailwind-merge, no DS dep).
- `Tabs.tsx` — Radix Tabs wrapped with DS-themed classes.
- `Select.tsx` — Radix Select wrapped with DS-themed classes.

**Pages (`apps/renderer/src/app/`)**

- `layout.tsx` — mounts `<ThemeScript />`, `<ThemeProvider>`, and async `<Chrome>`.
- `page.tsx` — home: welcome blurb + component grid (auto-discovered).
- `components/page.tsx` — same grid scoped under `/components`.
- `components/[slug]/page.tsx` — dynamic component page, renders `Mdx(readme, component)` when
  available else falls back to auto-listing all examples + the props table. Supports
  `generateStaticParams` for full SSG.
- `getting-started/page.tsx` + `content/getting-started.mdx` — install + setup guide.
- `theming/page.tsx` + `content/theming.mdx` — mode / variant / direction explainer + the
  override precedence ladder.

**Placeholder component (`packages/components/src/Placeholder/`)** — throwaway scaffolding so the
renderer has something to display until Phase 5 ships the real `<Button />`.

- `Placeholder.tsx` — `cv` recipe with `tone` (primary / neutral / success / danger) and `size`
  (sm / md / lg) variants, marked `@experimental`.
- `meta.ts` — category `Internal`, tags `scaffolding / demo / phase-4`.
- `README.mdx` — uses `<Callout>`, `<ExampleBlock>`, and `<PropsTable>`.
- `examples/Basic.tsx`, `examples/Tones.tsx`, `examples/Sizes.tsx` — runnable demos imported by
  the renderer via dynamic `import()`.

### Engine refinement

`VariantProps<T>` now accepts either a `VariantConfig` _or_ the `VariantFn` returned by `cv()`,
so component authors can write `VariantProps<typeof recipe>` directly. Optional members were
broadened with explicit `| undefined` to play well with `exactOptionalPropertyTypes: true`.

### Build / config wiring

- `packages/components/package.json` exposes `"./src/*": "./src/*"` so the renderer can resolve
  example sources via subpath. `tsup.config.ts` now prepends `'use client';` to the bundled JS
  (mirroring `@apx-dsine` and `@apx-apx-ds.
- `packages/components/tsconfig.json` excludes `src/**/examples/**` from local typechecking
  (examples import `apx-dsd would otherwise create a workspace cycle; they're transpiled
  by Next at runtime).
- `apps/renderer/next.config.mjs` adds a webpack alias
  (`@apx-dsponents/src` → `<repo>/packages/components/src`) so dynamic template imports
  resolve past the package `exports` field.
- `apps/renderer/src/app/globals.css` adds the Shiki light/dark crossfade rules and the dotted
  preview-frame background.

### Verification

- `pnpm typecheck` — 12/12 green.
- `pnpm test` — 11/11 green (170 tests across engine/tokens/theme/components).
- `pnpm lint` — 12/12 green (2 stale-disable-directive warnings carried from Phase 2).
- `pnpm format:check` — clean after `pnpm format`.
- `pnpm --filter @apx-dsderer build` — succeeds; 10 routes produced, `/components/[slug]`
  prerenders `placeholder` via `generateStaticParams`.
- `pnpm --filter @apx-dsderer dev` — `localhost:3000` serves all routes with status 200:
  `/`, `/components`, `/components/placeholder`, `/getting-started`, `/theming` (plus the legacy
  `/engine-demo` and `/theme-demo` pages kept from Phases 2 & 3).

### Acceptance criteria

- [x] `pnpm dev` starts the renderer at `localhost:3000`.
- [x] Editing a file in `packages/components/src/<X>/` triggers HMR (Next dev + `transpilePackages`).
- [x] Adding a new folder under `packages/components/src/` shows up in the sidebar — zero
      renderer code changes required.
- [x] Theme controls (mode / variant / dir) drive the preview region in real time.
- [x] `<ExampleBlock>` shows the live preview + Shiki-highlighted source from the actual
      example file.
- [x] `<PropsTable>` reads JSDoc + TS types via `react-docgen-typescript`.
- [x] Renderer chrome works even when a preview throws — `PreviewBoundary` traps the error.
- [x] `pnpm build:preview` succeeds.

### MDX custom components

Available inside any `README.mdx` or `content/*.mdx`:

| Tag                            | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `<Callout>`                    | Info / warning / danger / success aside boxes.         |
| `<ExampleBlock for="Basic" />` | Render a discovered example by id with preview + code. |
| `<PropsTable />`               | Auto-generated props table for the current component.  |

### Deferred (out of Phase 4)

- Sandpack editable playground per example.
- Algolia DocSearch / cross-page search.
- Versioned docs (multi-version side-by-side).
- Visual regression integration (Argos / Chromatic).
- A11y panel showing axe-core results per example.
- Figma deep links from each component.
- `pnpm new-component <Name>` codegen.
- Public deploy to Vercel.

### Next

Phase 5 — first real `<Button />` component (replaces `Placeholder`).