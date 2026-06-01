# Phase 57 — `<Icon />` + `<IconProvider />`

> Status: **Completed** · Owner: **SDS-Agent4** · **Tier 1** (single primitive — but cross-cuts every Tier-2 component) · Depends on: Phase 5 (Text — shipped), Phase 3 (`<Slot>` — shipped) · Used by: Toast, Alert, Button, EmptyState, NavigationMenu, Sidebar, Toolbar, Tabs, Stepper, ColorPicker, FileUpload, CommandPalette, Stat, DataGrid, Combobox, Select, Menu, Breadcrumbs, HoverCard, Carousel, … (every interactive primitive)
> The DS Icon primitive. Standardizes how every component declares "an icon goes here" — accessibility, sizing, color, dynamic loading, library independence.

## Objective

Ship the **`<Icon />`** primitive and its companion **`<IconProvider />`** — the single, canonical icon component for the entire DS.

### Why this matters now

Multiple shipped phases have called out this gap:

- **Phase 42 EmptyState Outcome**: *"No `Icon` / `Text` / `Stack` components exist in this codebase — plan references them. ... `icon` / `illustration` accept any `ReactNode` (consumer supplies their own icon library)."*
- Toast / Alert / Button / Spinner all currently inline raw SVGs or rely on `lucide-react` directly.
- Every Tier-2 plan I've authored (Sidebar, NavigationMenu, Toolbar, Stat, Breadcrumbs, ColorPicker, …) references `<Icon name="..." />` without that component existing.
- Consumers can't ship a coherent product UI without picking one of: lucide / heroicons / radix-icons / iconify / inline SVG.

The result today: every example uses a different inline SVG, every component allows `ReactNode` for icons, and there's no centralized way to:

- Set a default icon size that scales with the parent component's `size`.
- Make all icons inherit `currentColor` predictably.
- Support both **inline static** (lucide-react-style ESM imports → tree-shakeable) AND **dynamic registry** (string-name lookup → consumer registers icons up front).
- Provide an a11y contract that's right by default (decorative + `aria-hidden` by default; meaningful + `aria-label` opt-in).
- Forward the right ref + props + `data-*` attributes without surprises.

Phase 57 fixes all of this with **one primitive, < 1 KB gz** of code, and zero dependency lock-in.

---

## Public API

```tsx
import { Icon, IconProvider } from 'apx-ds';

// --- 1. INLINE STATIC MODE (lucide-react / heroicons / @radix-ui/react-icons / any ESM SVG component) ---
import { Mail } from 'lucide-react';

<Icon as={Mail} />                                  // 1em × 1em, currentColor, aria-hidden
<Icon as={Mail} size="md" />                        // sized via DS scale
<Icon as={Mail} color="danger" />                   // colored via DS palette
<Icon as={Mail} label="Inbox" />                    // a11y meaningful — auto removes aria-hidden, adds aria-label, role=img

// --- 2. DYNAMIC REGISTRY MODE (single component, many names) ---
// Up front, consumer wires their icon library to the DS at app boot:
import { createIconRegistry } from 'apx-ds';import * as Lucide from 'lucide-react';

const icons = createIconRegistry({
  mail: Lucide.Mail,
  user: Lucide.User,
  settings: Lucide.Settings,
  chevronRight: Lucide.ChevronRight,
  // …whatever set the app needs
});

// Then anywhere:
<IconProvider value={icons}>
  <App />
</IconProvider>

// And then:
<Icon name="mail" />                                // registry lookup
<Icon name="mail" size="lg" color="accent" label="Inbox" />

// --- 3. INLINE CHILDREN (custom SVG / illustration as a one-off) ---
<Icon size="md" label="Custom logo">
  <svg viewBox="0 0 24 24"><path d="..." /></svg>
</Icon>

// --- 4. NAMED ALIASES (every shipped component uses these strings) ---
// The DS internally references icons via a stable string set; consumers
// register their preferred SVG implementations once. See "DS Icon Catalog" below.

<Icon name="check" />                               // Used by Checkbox, Toggle, Select.ItemIndicator
<Icon name="chevron-down" />                        // Used by Select.Trigger, Accordion.Trigger, NavigationMenu
<Icon name="x" />                                   // Used by Modal.Close, Toast, Drawer.Close, Tags, etc.

// --- Full prop form ---
<Icon
  /* what to render — exactly one of these wins, in this precedence order: */
  as                          // ComponentType — inline static
  name                        // string — registry lookup (requires IconProvider)
  children                    // ReactNode — inline custom SVG

  /* sizing */
  size="md"                   // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number (px) | string (CSS length)
                              // default 'md' = 1em (inherits font-size of parent)
                              // 'xs'=12, 'sm'=14, 'md'=16, 'lg'=20, 'xl'=24 (px)

  /* color */
  color="current"             // 'current' (default = currentColor) | 'inherit'
                              //  | 'default' | 'muted' | 'subtle' | 'accent'
                              //  | 'success' | 'warning' | 'danger' | 'info'
                              //  | string (CSS color)

  /* a11y */
  label                       // string — meaningful icon; auto wires role + aria-label + removes aria-hidden
  decorative                  // boolean — explicit override (forces aria-hidden + role removal)
                              // (if neither label nor decorative is set: decorative=true by default)
  title                       // string — DEPRECATED-style native SVG title; usually use `label` instead

  /* polymorphism / interop */
  asChild                     // boolean — render via <Slot>; child is the SVG/ComponentType
  rotate                      // 0 | 90 | 180 | 270 — visual rotation (CSS transform)
  flip                        // 'horizontal' | 'vertical' | 'both' — CSS scale flip
  spin                        // boolean — applies the spinner ring animation
                              //         (consistent w/ Phase 39 Spinner; respects prefers-reduced-motion)

  /* visual variant */
  variant="default"           // 'default' | 'filled' | 'duotone' (when supported by the underlying icon)
                              // (passed through to libraries that distinguish, e.g. heroicons solid/outline;
                              //  ignored by libraries that don't)

  /* container */
  className=""
  style={{}}
  ref={…}                     // forwarded to the rendered <svg> (or single root element)
>
  {children?}                  // optional inline SVG children
</Icon>

// --- createIconRegistry ---
function createIconRegistry(map: Record<string, ComponentType<SVGProps<SVGSVGElement>>>): IconRegistry;

// --- IconProvider ---
<IconProvider
  value={icons}              // IconRegistry — from createIconRegistry()
  /* optional defaults applied to all Icons in this subtree */
  defaultSize="md"
  defaultColor="current"
  defaultVariant="default"
  fallback                    // ComponentType — rendered when a name lookup misses; default = empty 1em box
  onMissing                   // (name: string) => void — dev warning hook (default: console.warn in dev only)
>
  {children}
</IconProvider>

// --- Hook for advanced cases ---
const { resolve, resolveOrThrow, has } = useIconRegistry();
const MailIcon = resolve('mail');                    // ComponentType | undefined
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Library-agnostic** — works with lucide / heroicons / radix-icons / iconify / hand-rolled SVGs | DS shouldn't lock consumers into a specific icon library. Every team has their own visual brand. |
| **Three coexisting modes**: `as` (static) / `name` (registry) / children (inline) | `as` for one-off imports in a single file; `name` for the 80% case (consumer registers their set once); children for custom SVG. |
| **`name` lookup needs an `IconProvider`** — explicit, not magical       | We never ship an opinionated icon set. Consumers wire their own at the app root.                                |
| **Default `size="md"` = 1em**                                          | Inherits the parent's font size. Drop an Icon inside a `text-sm` Button → it scales naturally without explicit sizing. Numeric sizes still available for layouts that need them. |
| **Default `color="current"` = currentColor**                          | Inherits parent's text color. Drop inside a Button with `color="danger"` → icon turns red automatically. |
| **`decorative=true` is the default**                                  | Most icons are decorative (paired with visible text). Forcing `aria-hidden` by default eliminates the most common a11y bug.|
| **`label` makes the icon meaningful** in one prop                      | Sets `role="img"` + `aria-label` + removes `aria-hidden`. Single explicit knob.                                  |
| **No baked-in icon catalog**                                           | The DS only ships *the wiring*. Catalog is a string set (documented below) — consumer registers their library against those strings. |
| **`rotate` / `flip` / `spin` are CSS-only utility props**            | Common needs (rotating chevrons, RTL-mirroring back arrows, loading-state icon). One prop each instead of a `className` dance. |
| **`asChild` via Slot**                                               | Power users can do `<Icon asChild><MyCustomWrapper>…</MyCustomWrapper></Icon>` to inject middleware (e.g. tooltip, animation). |
| **`variant` is hint-only**                                            | Libraries that differentiate solid/outline (heroicons) can use it; libraries that don't (lucide) ignore it. Consumer's IconRegistry decides how. |
| **`spin` reuses the Spinner ring animation keyframes**               | Already in `tailwind-preset.ts`; no new CSS.                                                                     |
| **No `box` or `circle` background**                                   | Decorative containers around icons belong in higher-level components (Badge, Avatar, Stat). Icon stays atomic.   |

---

## Internal architecture

```
                  ┌──────────────────────────────────────────────┐
   <Icon …>  ────►│  Resolves what to render in 3-tier precedence:│
                  │   1. props.children → render children as <svg>│
                  │   2. props.as       → render <As />            │
                  │   3. props.name     → IconRegistry.resolve()   │
                  │                                                │
                  │  Computes:                                     │
                  │   - sizeClass / sizeStyle from size            │
                  │   - colorClass / colorStyle from color         │
                  │   - aria attributes from label / decorative    │
                  │   - rotate / flip / spin classes               │
                  │                                                │
                  │  Forwards merged props to the resolved svg     │
                  └──────────────────────────────────────────────┘
                                  │
                                  ▼
                  ┌──────────────────────────────────────────────┐
                  │  <Slot> (when asChild) OR rendered svg/component│
                  │   role={meaningful ? 'img' : undefined}        │
                  │   aria-label={label}                            │
                  │   aria-hidden={decorative ? 'true' : undefined}│
                  │   focusable="false"  (IE/legacy safety)        │
                  │   className={mergedClasses}                    │
                  │   style={{ width: size, height: size, color, transform }}│
                  └──────────────────────────────────────────────┘
```

`IconProvider` is a context provider wrapping `IconRegistryContext`. Default registry is **empty** — `name=` lookups in apps without a provider produce a dev warning + render the fallback (default: empty `<span />`).

---

## File Structure

```
packages/components/src/Icon/
├── Icon.tsx
├── IconProvider.tsx
├── IconRegistry.ts                 # createIconRegistry, type IconRegistry
├── IconRegistry.context.ts
├── useIconRegistry.ts
├── Icon.types.ts
├── Icon.recipe.ts
├── resolveIconA11y.ts              # pure — (label, decorative, title) → aria attrs
├── resolveIconSize.ts              # pure — size token → { width, height, fontSize? }
├── resolveIconColor.ts             # pure — color token → tailwind class OR inline style
├── DS_ICON_CATALOG.ts              # documented stable string set (see below)
├── Icon.test.tsx
├── Icon.modes.test.tsx              # as / name / children — precedence + fallback
├── Icon.a11y.test.tsx
├── Icon.transforms.test.tsx         # rotate / flip / spin
├── IconProvider.test.tsx
├── useIconRegistry.test.tsx
├── resolveIconA11y.test.ts
├── resolveIconSize.test.ts
├── resolveIconColor.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicAsLucide.tsx              # <Icon as={Mail} />
    ├── BasicNameRegistry.tsx          # createIconRegistry + IconProvider + <Icon name=…>
    ├── BasicChildrenInline.tsx        # <Icon><svg>…</svg></Icon>
    ├── Sizes.tsx
    ├── SizesNumeric.tsx
    ├── Colors.tsx
    ├── MeaningfulVsDecorative.tsx
    ├── Rotate.tsx
    ├── Flip.tsx
    ├── Spin.tsx                       # spinner-icon use
    ├── InButton.tsx                   # inherits color + size
    ├── InBadge.tsx
    ├── InAlert.tsx
    ├── InToastIntents.tsx
    ├── MissingNameFallback.tsx
    ├── AsChildWithTooltip.tsx
    └── DSIconCatalog.tsx               # showcases the canonical name set
```

---

## DS Icon Catalog (stable string contract)

The DS *internally* references these names. When a consumer wires `IconProvider`, registering these will light up every shipped component automatically.

| Name                       | Used by                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| `check`                    | Checkbox (checked), Toggle (selected), Select.ItemIndicator, Stepper (completed) |
| `check-circle`             | Toast.success, Alert.success, EmptyState.success                                 |
| `minus`                    | Checkbox (indeterminate), Stat.Delta (no-change)                                 |
| `x`                        | Modal.Close, Drawer.Close, Toast.dismiss, TagsInput tag-remove, Combobox clear   |
| `x-circle`                 | Alert.danger, Toast.error, FileUpload error per-file                              |
| `alert-triangle`           | Alert.warning, Toast.warning                                                      |
| `info`                     | Alert.info, Toast.info                                                            |
| `chevron-down`             | Select, Accordion, NavigationMenu (mobile collapse marker)                       |
| `chevron-up`               | Accordion (expanded), NumberInput stepper                                         |
| `chevron-left`             | Carousel.Prev, Pagination.Prev, DatePicker month nav                              |
| `chevron-right`            | Carousel.Next, Pagination.Next, Breadcrumbs separator, Sidebar expandable        |
| `chevrons-up-down`         | DataGrid column sort indicator (unsorted)                                         |
| `arrow-up`                 | Stat.Delta positive, DataGrid sort asc, Toolbar overflow                          |
| `arrow-down`               | Stat.Delta negative, DataGrid sort desc                                           |
| `search`                   | CommandPalette, Combobox, DataGrid search                                         |
| `loader`                   | Spinner default glyph (when registry mode is preferred)                          |
| `eye` / `eye-off`          | Input type=password reveal toggle (future)                                        |
| `plus`                     | NumberInput step-up, Sidebar new-item                                            |
| `more-horizontal`          | Menu trigger default, Toolbar overflow, Table row actions                         |
| `more-vertical`            | (alternative orientation)                                                         |
| `calendar`                 | DatePicker trigger                                                                |
| `clock`                    | DatePicker time variant, Timeline                                                |
| `upload`                   | FileUpload drop-zone                                                              |
| `file`                     | FileUpload item                                                                   |
| `download`                 | FileUpload item action                                                            |
| `pause`                    | Carousel.AutoplayControl (playing state)                                          |
| `play`                     | Carousel.AutoplayControl (paused state)                                           |
| `eye-dropper`              | ColorPicker eyedropper                                                            |
| `copy`                     | Code blocks, color hex value                                                      |
| `star`                     | Rating glyph                                                                      |
| `star-half`                | Rating half-step glyph                                                            |

The DS exports `DS_ICON_NAMES` (typed `as const`) so consumers get TypeScript autocompletion and can typecheck their registry:

```ts
import { DS_ICON_NAMES, createIconRegistry } from 'apx-ds';import * as Lucide from 'lucide-react';

const registry = createIconRegistry({
  check: Lucide.Check,
  'check-circle': Lucide.CheckCircle2,
  'chevron-down': Lucide.ChevronDown,
  // …compiler will warn if a DS name is missing when strict mode is on
});
```

Strict mode (opt-in): `createIconRegistry({ … }, { strict: true })` requires all `DS_ICON_NAMES` to be provided.

---

## Recipe sketches

```ts
export const iconRecipe = cv({
  base: 'inline-block shrink-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current [&_svg]:stroke-current',
  variants: {
    size: {
      xs: 'h-3   w-3   text-[12px]',
      sm: 'h-3.5 w-3.5 text-[14px]',
      md: 'h-4   w-4   text-[16px]',
      lg: 'h-5   w-5   text-[20px]',
      xl: 'h-6   w-6   text-[24px]',
    },
    color: {
      current:  'text-current',
      inherit:  'text-inherit',
      default:  'text-fg-default',
      muted:    'text-fg-muted',
      subtle:   'text-fg-subtle',
      accent:   'text-accent-emphasis',
      success:  'text-success-emphasis',
      warning:  'text-warning-emphasis',
      danger:   'text-danger-emphasis',
      info:     'text-info-emphasis',
    },
    rotate: {
      0:   '',
      90:  'rotate-90',
      180: 'rotate-180',
      270: '-rotate-90',
    },
    flip: {
      none:       '',
      horizontal: 'scale-x-[-1]',
      vertical:   'scale-y-[-1]',
      both:       'scale-x-[-1] scale-y-[-1]',
    },
    spin: { true: 'animate-spin motion-reduce:animate-none', false: '' },
  },
  defaultVariants: { size: 'md', color: 'current', rotate: 0, flip: 'none', spin: false },
});
```

Numeric / string `size` falls through to inline `style={{ width, height }}`; class-based path applies when `size` is a known token.

---

## `resolveIconA11y.ts` (pure)

```ts
export function resolveIconA11y(args: {
  label?: string;
  decorative?: boolean;
  title?: string;
}): {
  role: 'img' | undefined;
  'aria-label': string | undefined;
  'aria-hidden': true | undefined;
} {
  const meaningful = args.label !== undefined && args.label.length > 0;
  const explicitlyDecorative = args.decorative === true;
  const isDecorative = explicitlyDecorative || !meaningful;

  return {
    role: meaningful && !explicitlyDecorative ? 'img' : undefined,
    'aria-label': meaningful && !explicitlyDecorative ? args.label : undefined,
    'aria-hidden': isDecorative ? true : undefined,
  };
}
```

Pure, deterministic, unit-tested for all 8 input permutations.

---

## A11y

- **Decorative by default**: `aria-hidden="true"`. Most icons are paired with visible text; AT users hear the text.
- **Meaningful via `label`**: `role="img"` + `aria-label={label}`. AT users hear the label.
- **`focusable="false"`** on every `<svg>` to prevent IE/legacy tab-stop bug.
- **No `title` element by default**: `<title>` inside `<svg>` is announced inconsistently across screen readers; `aria-label` is more reliable. `title` prop available for niche cases.
- **`rotate` / `flip`** don't change semantics. RTL handling for direction-meaningful icons (back arrows, chevrons-end) is the consumer's call — Icon doesn't auto-flip; the parent component does.
- axe-core: 0 violations in decorative / meaningful / asChild / spinning modes.

---

## RTL

- Icon itself is direction-agnostic.
- Consumer parents (Breadcrumbs separator, Carousel Prev/Next, NavigationMenu chevrons) flip via `dir`-aware class or by passing `flip="horizontal"` from their parent recipe.
- Documentation calls out the pattern: "for direction-meaningful icons, set `flip` from the consuming component based on `dir`."

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                          | Default (en)             |
| ---------------------------- | ------------------------ |
| `icon.missing`               | "Missing icon: {{name}}" | (dev-only fallback rendering text) |

i18n surface is minimal — Icon labels are consumer-supplied strings.

---

## Performance

- Pure stateless component.
- Registry lookup is O(1) Map access.
- Tree-shakeable: each icon-library import (`as` mode) is the consumer's import; Icon doesn't pull anything.
- `<IconProvider>` is a stable-reference context; only re-renders when the registry object identity changes.
- Bundle target: **< 1 KB gz** (Icon + IconProvider + helpers).

---

## Migration plan for shipped components

Phase 57 ships with **no breaking changes**. Existing components keep accepting `ReactNode` for their icon slots. Migration is opt-in and incremental:

### Optional follow-up PRs (one per component, post-Icon ship):

- **Toast**: replace inline `<Loader2 />` + intent SVGs with `<Icon name="loader" />` / `<Icon name="check-circle" />`.
- **Alert**: replace `lucide-react` direct imports with `<Icon name="..." />`.
- **Button**: existing `leadingIcon` / `trailingIcon` props keep accepting `ReactNode`. The recommended pattern in docs becomes `<Button leadingIcon={<Icon name="check" />}>`.
- **Spinner**: standalone `<Spinner />` remains as is. New `<Icon spin name="loader" />` is an *alternative* for when an icon's color/size needs to follow text rather than a fixed palette.
- **EmptyState**: `icon` prop continues to accept `ReactNode`. Docs recommend `<Icon name="..." size="lg" />` over inline SVG.

None of the existing tests need to change. The DS gets a coherent icon story without forcing a rewrite.

---

## Testing

- **`as` mode**: passes through the component, applies size + color classes, forwards ref.
- **`name` mode**: registry lookup; missing name → fallback + `onMissing` callback fires (dev only).
- **`children` mode**: renders custom SVG inside the wrapper.
- **Precedence**: children > as > name.
- **Size**: tokens → expected classes; numeric → inline `style.width` / `style.height`.
- **Color**: tokens → expected classes; arbitrary CSS color → inline `style.color`.
- **A11y**: `decorative=true` → aria-hidden; `label="…"` → aria-label + role=img + no aria-hidden; both set → label wins (decorative ignored with dev warning); neither → aria-hidden (decorative-by-default).
- **Transforms**: `rotate=90` / `flip="horizontal"` / `spin` apply correct classes.
- **`spin` + reduced motion**: animation disabled when `prefers-reduced-motion: reduce`.
- **`asChild`**: child receives merged className + style + aria attrs.
- **`IconProvider`**: name resolution; nested providers (inner overrides outer); empty default registry warns on dev.
- **`createIconRegistry` strict mode**: TypeScript error when a DS_ICON_NAME is missing (covered by ts-expect-error tests).
- **`useIconRegistry`**: `resolve` / `has` / `resolveOrThrow` semantics.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<Icon>`, `<IconProvider>`, `createIconRegistry`, `useIconRegistry`, `DS_ICON_NAMES` all exported.
- [ ] Three render modes (`as` / `name` / `children`) with documented precedence.
- [ ] Library-agnostic — no `lucide-react` or other icon library imported by the Icon source.
- [ ] `size` accepts both tokens and arbitrary CSS lengths.
- [ ] `color` accepts both DS tokens and arbitrary CSS colors.
- [ ] `decorative=true` default; `label` makes icon meaningful.
- [ ] `rotate` / `flip` / `spin` utility props.
- [ ] `asChild` via Slot.
- [ ] Pure helpers (`resolveIconA11y`, `resolveIconSize`, `resolveIconColor`) tested in isolation.
- [ ] `DS_ICON_NAMES` typed `as const`; strict-mode registry validates against it.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 1 KB gz.
- [ ] No breaking changes to existing components.

---

## DRY Self-Check

- [ ] Reuses `cv`, `useThemedClasses`, `<Slot>`, `forwardRef`, `useId` (only when label is set and id needs to be stable).
- [ ] No new color tokens — reuses existing palette.
- [ ] No new keyframes — `spin` reuses `animate-spin` from Tailwind.
- [ ] Pure helpers + tests prevent regressions on the a11y matrix.
- [ ] Strict-mode registry validates the DS_ICON_NAMES contract at compile time.

---

## Out of scope (deferred)

- **Built-in icon set / sprite**: The DS will never ship a default icon library. Consumer choice is a feature.
- **Iconify dynamic CDN fetch**: Consumers who want runtime-fetched icons can use Iconify directly via `as={IconifyIcon}`.
- **Color customization mid-glyph** (e.g. duotone arbitrary colors): the underlying icon library handles this. Icon passes through.
- **Animation library beyond `spin`**: bounce, pulse, etc. belong in Motion / consumer code, not Icon.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/57-icon.md`.
2. Outcome notes: bundle delta, follow-up PR list per shipped component for opt-in migration.
3. Document the canonical IconProvider setup in the `Getting Started` docs page so it's the first thing consumers wire.
4. Add a "Recommended icon libraries" page that shows boilerplate for: lucide-react / heroicons / @radix-ui/react-icons / iconify-react.

---

## Outcome

### Public API delivered

- `<Icon>` — the primitive. Three render-source axes (`children` > `as` > `name`), DS size + color tokens with arbitrary-value fallbacks (numeric px, `1.5rem`, `#hex`, `var(--…)`), decorative-by-default a11y, `rotate` / `flip` / `spin` utility props, `asChild` via `<Slot>`, forwards `ref` to the rendered SVG / wrapper, forwards arbitrary SVG attributes / event handlers / `data-*`.
- `<IconProvider>` — context provider for the registry plus cascading `defaultSize` / `defaultColor` / `defaultVariant` / `fallback` / `onMissing`. Nests cleanly (innermost wins).
- `createIconRegistry(map, { strict? })` — frozen, O(1) `Map`-backed registry. Strict-overload TypeScript signature requires the source map to cover every `DSIconName`; runtime strict-mode emits dev warnings for missing names if a JS consumer opts in without the type guard.
- `useIconRegistry()` — `{ resolve, resolveOrThrow, has, keys }`. Subscribes to provider changes via context.
- `DS_ICON_NAMES` — `readonly` tuple `as const` (31 names). `DSIconName` union derived from it.
- Pure helpers exported: `resolveIconA11y`, `resolveIconSize`, `resolveIconColor`, `isIconSizeToken`, `isIconColorToken`, `EMPTY_ICON_REGISTRY`.

### Engine + DS consumption (DRY validated)

- `forwardRef` from `@apx-dsine` — standard Icon ref-forwarding contract.
- `Slot` from `@apx-dsine` — `asChild` path (second consumer outside Stat / EmptyState / Divider / etc.).
- `cv` from `@apx-dsine` — `iconRecipe` (size / color / rotate / flip / spin variants).
- `useThemedClasses` from `@apx-dsme` — recipe → class + style resolution. No new theme tokens introduced.
- `motion-reduce:animate-none` — reuses Tailwind preset's existing animation utilities; no new keyframes.

### File map

```
packages/components/src/Icon/
├── Icon.tsx                        (137 LoC)
├── IconProvider.tsx                 (45 LoC)
├── IconRegistry.ts                  (77 LoC)
├── IconRegistry.context.ts          (29 LoC)
├── useIconRegistry.ts               (40 LoC)
├── DS_ICON_CATALOG.ts               (56 LoC)
├── Icon.types.ts                   (130 LoC)
├── Icon.recipe.ts                   (60 LoC)
├── resolveIconA11y.ts               (36 LoC)
├── resolveIconSize.ts               (40 LoC)
├── resolveIconColor.ts              (52 LoC)
├── index.ts                         (45 LoC)
├── meta.ts                          (10 LoC)
├── README.mdx
└── examples/
    ├── _glyphs.tsx                  (16 hand-rolled SVGs — self-contained, no library dep)
    ├── BasicAsLucide.tsx
    ├── BasicNameRegistry.tsx
    ├── BasicChildrenInline.tsx
    ├── Sizes.tsx
    ├── SizesNumeric.tsx
    ├── Colors.tsx
    ├── MeaningfulVsDecorative.tsx
    ├── Rotate.tsx
    ├── Flip.tsx
    ├── Spin.tsx
    ├── InButton.tsx
    ├── InBadge.tsx
    ├── InAlert.tsx
    ├── InToastIntents.tsx
    ├── MissingNameFallback.tsx
    ├── AsChildWithTooltip.tsx
    └── DSIconCatalog.tsx
```

### Tests (64 passing across 5 files, **0 axe violations**)

| File | Count | Coverage |
| ---- | ----: | -------- |
| `Icon.helpers.test.ts` | 15 | `resolveIconA11y` (6 permutations) + `resolveIconSize` (5) + `resolveIconColor` (4) + token discriminators |
| `Icon.test.tsx` | 15 | Mode precedence (children > as > name), size token + numeric + CSS-length, color token + arbitrary, `asChild` via Slot, ref forwarding, `data-*` + `onClick` pass-through |
| `Icon.registry.test.tsx` | 15 | `createIconRegistry` resolve / has / keys / strict warnings, source-map decoupling, `<IconProvider>` nesting (innermost wins), `useIconRegistry` resolve / resolveOrThrow, `onMissing` callback, `fallback` rendering, cascading provider defaults, per-Icon overrides |
| `Icon.transforms.test.tsx` | 9 | `rotate=0/90/180/270`, `flip=none/horizontal/vertical/both`, `spin` + `motion-reduce` |
| `Icon.a11y.test.tsx` | 10 | Decorative-by-default, label promotion, explicit decorative override, `focusable="false"`, axe across 6 modes (decorative beside text, meaningful standalone, label-driven, registry-resolved, asChild, spin loader) |

Full regression run: **2364 / 2364 tests passing across 138 files.** No other components disturbed.

### Bundle

- `packages/components/src/Icon` — raw 4977 bytes, **gzipped 2.11 KB** (target was < 1 KB).
- Bundle overshoot reasons (none load-bearing enough to remove):
  - **Registry runtime strict-mode check** — loops over `DS_ICON_NAMES` to warn for JS-only consumers. ~250 B; could be `__DEV__`-gated by a future build step (DS doesn't currently wire one).
  - **`DS_ICON_NAMES` array literal** — 31 string entries, ~600 B raw. Required for typed autocompletion + strict-mode validation. A future split could move the catalog into a separate `apx-dsn-catalog` entry that consumers opt-into when they want strict mode, getting the base primitive under 1 KB.
  - **Three render modes + `asChild`** — each branch is small but together they're the bulk of Icon.tsx.
  - **Provider cascade** — `useContext` + merge of `defaultSize` / `defaultColor` per-render. Could be lifted into the resolve helpers but cost is small.
- Single new export adds ~2 KB gz to the DS, then **every subsequent icon use is zero additional cost** — the consumer's icon library is the consumer's own import, no Icon-library code lives in DS.

### A11y guarantees (axe verified)

- `aria-hidden="true"` by default; `label` promotes to `role="img"` + `aria-label`; explicit `decorative` overrides.
- `focusable="false"` on every rendered SVG (IE/legacy tab-stop guard).
- `<title>` not auto-injected — `aria-label` is the predictable surface across screen readers.
- `spin` honors `prefers-reduced-motion: reduce`.

### Deviations from plan

1. **`title` prop dropped** — plan listed it as DEPRECATED-style; we removed it entirely. `label` covers the meaningful path; consumers needing native `<title>` can inline-children with their own SVG that includes one. Trimmed type surface + ~30 B.
2. **`variant` accepted but ignored at the Icon layer** — kept on the type for forward compatibility (libraries that distinguish solid / outline can use it via their own component wrappers around `<Icon as={Solid} />`). Not wired into the recipe because the DS doesn't ship variants of any icon. Dev cost: 0.
3. **`InToastIntents` example uses Toast's `icon` slot** — confirmed Toast accepts `ReactNode` for `icon`; example wraps `<Icon as={…} />` rather than adding a new Toast API. Aligns with the "no breaking changes" mandate.
4. **`_glyphs.tsx` ships hand-rolled SVGs** — the DS still imports zero icon libraries (validated by the bundle measurement). Examples are self-contained so they render in the renderer without forcing a `lucide-react` dependency on the examples module.
5. **`acceptIconNameAlias` plan section** — not implemented; intentionally kept the name set tight. Future work if real consumer pressure emerges.

### Follow-up migration PRs (opt-in, non-breaking)

Suggested order, each PR scoped to a single component:

1. **Toast** — replace inline intent SVGs + `Loader2` with `<Icon name="loader" />` / `<Icon name="check-circle" />` etc.
2. **Alert** — replace `lucide-react` direct imports with `<Icon name="..." />`.
3. **Combobox** — `Check` / `ChevronDown` / `X` glyphs → `<Icon name="..." />`.
4. **Select / Menu / Checkbox** — same idea.
5. **CommandPalette** — `search` glyph → `<Icon name="search" />`.

Each follow-up is small (3–10 LoC swap), keeps existing `ReactNode`-accepting props, and removes a `lucide-react` import from the DS source for that component. Once enough components migrate, `lucide-react` could be moved from `dependencies` → `devDependencies` (or removed entirely), trimming the DS bundle for consumers who don't use the icon-using components.

### Knowledge surfaced for future work

- **Module-level `Set` for dedup warnings** — `warnedMissing` in `Icon.tsx` mirrors the pattern Toast uses for its imperative store. Worth extracting into `@apx-dsine/devWarn` if a third consumer needs the same pattern.
- **Token-vs-arbitrary value split** in `resolveIconSize` / `resolveIconColor` is reusable for any component that needs to accept both DS tokens and raw CSS. Worth promoting to a generic helper if a fourth recipe-driven component (Stack? Heading?) wants the same.
- **Strict-mode-by-typescript-overload pattern** in `createIconRegistry` is the cleanest "exhaustive contract enforced at compile time, gracefully warned at runtime" mechanism the DS has used so far. Reusable for any registry-shaped API (e.g. a future `createMotionRegistry`).