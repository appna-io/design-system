# Phase 13 — `<Avatar />` + `<AvatarGroup />`

> Status: **Pending** · Depends on: Phase 12 (Badge — proves the small-surface matrix) · Blocks: none

## Objective

Ship the user-identity glyph — `<Avatar />` — covering image load, initials fallback, icon
fallback, status indicator, and the multi-user **stack** (`<AvatarGroup />`). Avatar is the first
component in the DS that **changes its rendered tree based on async state** (image loaded vs broken
vs empty), so the plan explicitly designs the state machine so it doesn't end up scattered across
useEffects.

---

## What This Component Proves

- An "image-with-fallback" state machine can live inside a tiny custom hook (`useAvatarImage`) and stay testable.
- The DS handles **shape morphing** (circle / rounded / square) without losing the variant matrix.
- A composite (Avatar + AvatarGroup) ships in one phase, with the group exercising the slot pattern for "overflow indicator" (`+N`).
- Indicator badge positioning works without a positioning engine (purely CSS corners).

---

## Public API

```tsx
import { Avatar, AvatarGroup } from 'apx-ds';

<Avatar src="https://…/me.jpg" name="Ada Lovelace" />

<Avatar
  src="https://…/me.jpg"          // primary image source
  srcSet=""                       // optional, browser handles density
  alt=""                          // overrides auto-alt; default is `name`
  name="Ada Lovelace"             // used for initials + auto-alt + color hash

  variant="solid"                 // 'solid' (default) | 'outline' | 'soft' — affects fallback
  size="md"                       // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color="auto"                    // 'auto' (hash from name) | any 7-color value
  shape="circle"                  // 'circle' (default) | 'rounded' | 'square'

  fallbackIcon={<UserIcon />}     // if no name + no image — defaults to a built-in person icon
  delayMs={600}                   // wait this long before showing fallback (avoids flicker for fast loads)

  status="online"                 // 'online' | 'offline' | 'away' | 'busy' | undefined — colored dot in corner
  statusPlacement="bottom-right"  // 'top-right' | 'top-left' | 'bottom-right' (default) | 'bottom-left'

  ring="primary"                  // optional accent ring (any color name) — useful for "active speaker" patterns

  asChild={false}                 // <Avatar asChild><a /></Avatar>

  className=""
  style={{}}
  sx={{}}
/>

<AvatarGroup
  max={4}                         // show this many, collapse the rest into "+N"
  size="md"                       // propagates to all children
  shape="circle"
  spacing="-2"                    // overlap distance in spacing-token units; default -2 (16px nudge)
  variant="solid"                 // propagates as default
>
  <Avatar src="…" name="Ada" />
  <Avatar src="…" name="Bren" />
  <Avatar src="…" name="Cleo" />
  <Avatar src="…" name="Dax" />
  <Avatar src="…" name="Eli" />
  <Avatar src="…" name="Fae" />
</AvatarGroup>
```

### Prop Decisions

- **`name` is the canonical labeling prop** — drives initials, color hashing, and `alt` fallback. `alt` only overrides when explicitly set.
- **`color="auto"` deterministically hashes the name** into the 7-color palette so the same person consistently gets the same fallback bg across the app. Pure function — no random.
- **`delayMs={600}` debounces the fallback** to avoid the brief "initials → image" flash on fast loads. Standard pattern from Radix Avatar.
- **`status` is an enum, not a free `color`** — limits the affordance to its UX meaning. Internally maps `online→success`, `offline→neutral`, `away→warning`, `busy→danger`.
- **`AvatarGroup` propagates size/shape/variant** but per-Avatar overrides win — same pattern as `RadioGroup`.

---

## Variants — Designed Inline

Three variants. **These describe the fallback state's appearance**, since when an image loads it
covers the bg. Image-loaded Avatars look identical across variants (modulo border).

| Variant   | Fallback bg                | Fallback text/icon         | Border             | When to use                                          |
| --------- | -------------------------- | -------------------------- | ------------------ | ---------------------------------------------------- |
| `solid`   | `bg-<color>`               | `text-<color>-contrast`    | none               | **Default.** Strongest readability on busy UIs.       |
| `outline` | `bg-bg-paper`              | `text-<color>`             | `border-<color>` 2px| Lighter; matches outline Buttons/Inputs.             |
| `soft`    | `bg-<color>-subtle`        | `text-<color>`             | none               | Editorial; pairs well with `soft` Badges.            |

When an image loads, the bg + initials are hidden via opacity (kept in DOM for instant fallback on
re-render). Border (variant `outline`) **stays** so the ring around the image keeps the brand color.

### Variant × color matrix

3 × 7 = 21 cells, identical pattern to Badge/Checkbox. Generated by the matrix helper.

### Sizes

| Size | Pixel size | Font for initials | Status dot | Icon fallback |
| ---- | ---------- | ----------------- | ---------- | ------------- |
| `xs` | `size-6`   | `text-[10px]`     | `size-1.5` | `size-3`      |
| `sm` | `size-8`   | `text-xs`         | `size-2`   | `size-4`      |
| `md` | `size-10`  | `text-sm`         | `size-2.5` | `size-5`      |
| `lg` | `size-12`  | `text-base`       | `size-3`   | `size-6`      |
| `xl` | `size-16`  | `text-lg`         | `size-3.5` | `size-8`      |
| `2xl`| `size-24`  | `text-2xl`        | `size-4`   | `size-12`     |

Six sizes (more than Badge/Button) because Avatars genuinely range from list-cell glyphs to hero
profile photos.

### Shapes

```ts
variants: {
  shape: {
    circle:  'rounded-full',
    rounded: 'rounded-lg',  // size-adaptive feel; uses theme radius
    square:  'rounded-none',
  },
}
```

### Ring (accent border outside the avatar)

```ts
variants: {
  ring: {
    none: '',
    primary:   'ring-2 ring-offset-2 ring-offset-bg ring-primary',
    secondary: 'ring-2 ring-offset-2 ring-offset-bg ring-secondary',
    // …7 colors
  },
}
```

The ring is **outside** the avatar's circle, sitting in the offset gap. Useful for "active speaker"
or "current user" highlighting. Distinct from the optional `outline` variant border.

---

## File Structure

```
packages/components/src/Avatar/
├── Avatar.tsx
├── AvatarGroup.tsx
├── Avatar.types.ts
├── Avatar.recipe.ts          # two-slot recipe (root + fallback) + ring axis
├── Avatar.icons.tsx          # UserIcon fallback
├── useAvatarImage.ts         # image load/error state machine
├── hashColor.ts              # deterministic name → color
├── initials.ts               # name → "AL" / "MJ" / etc.
├── AvatarGroupContext.ts     # internal context
├── Avatar.test.tsx
├── AvatarGroup.test.tsx
├── Avatar.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx            # incl. auto-hash
    ├── Shapes.tsx
    ├── Fallback.tsx          # name-only, broken-image, icon-only
    ├── WithStatus.tsx
    ├── WithRing.tsx
    ├── Group.tsx             # AvatarGroup with max=4
    ├── AsChild.tsx
    └── ProfileCard.tsx       # realistic composition (Avatar + name + role)
```

---

## State Machine — `useAvatarImage`

```ts
// Avatar.useAvatarImage.ts
type AvatarImageState = 'idle' | 'loading' | 'loaded' | 'error';

export function useAvatarImage(src: string | undefined, delayMs: number): AvatarImageState {
  // 1. No src                          → 'idle'
  // 2. src set, image instantiating    → 'loading'
  // 3. img.onload fires within delayMs → 'loaded' immediately
  // 4. img.onload fires after delayMs  → 'loaded' (we may have shown fallback briefly)
  // 5. img.onerror fires               → 'error'
  // delayMs only gates whether we *display* the fallback — the state machine ignores it.
  // The render decides: if state === 'loaded' show image; else if past delayMs show fallback;
  // else show nothing (blank).
}
```

Tested independently — no React render. Three jsdom tests:

- New `src` resets to `loading`
- `onload` → `loaded`
- `onerror` → `error`

---

## Recipe Sketch

```ts
// Avatar.recipe.ts
import { cv } from '@apx-dsine';

export const avatarRecipes = {
  root: cv({
    base: [
      'relative inline-flex items-center justify-center overflow-hidden',
      'font-medium select-none uppercase',
      'bg-bg-subtle text-fg-default',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        outline: 'border-2 bg-bg-paper',
        soft: '',
      },
      size: {
        xs:  'size-6 text-[10px]',
        sm:  'size-8 text-xs',
        md:  'size-10 text-sm',
        lg:  'size-12 text-base',
        xl:  'size-16 text-lg',
        '2xl': 'size-24 text-2xl',
      },
      shape: { circle: 'rounded-full', rounded: 'rounded-lg', square: 'rounded-none' },
      color: { auto: '', primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
      ring: { none: '', primary: 'ring-2 ring-offset-2 ring-offset-bg ring-primary', /* …6 more */ },
    },
    compoundVariants: [
      /* 3 × 7 = 21 cells; identical pattern to Badge */
    ],
    defaultVariants: { variant: 'solid', size: 'md', shape: 'circle', color: 'auto', ring: 'none' },
  }),
  fallback: cv({
    base: 'absolute inset-0 flex items-center justify-center',
    variants: {},
  }),
  status: cv({
    base: 'absolute block rounded-full ring-2 ring-bg',
    variants: {
      size: {
        xs:  'size-1.5',
        sm:  'size-2',
        md:  'size-2.5',
        lg:  'size-3',
        xl:  'size-3.5',
        '2xl': 'size-4',
      },
      placement: {
        'top-right':    'top-0 right-0 translate-x-1/4 -translate-y-1/4',
        'top-left':     'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
        'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
        'bottom-left':  'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
      },
      tone: {
        online:  'bg-success',
        offline: 'bg-neutral',
        away:    'bg-warning',
        busy:    'bg-danger',
      },
    },
    defaultVariants: { size: 'md', placement: 'bottom-right', tone: 'online' },
  }),
};
```

---

## Component Sketch

```tsx
'use client';
import { forwardRef, Slot } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useAvatarImage } from './useAvatarImage';
import { useAvatarGroup } from './AvatarGroupContext';
import { hashColor } from './hashColor';
import { getInitials } from './initials';
import { avatarRecipes } from './Avatar.recipe';
import { UserIcon } from './Avatar.icons';
import type { AvatarProps } from './Avatar.types';

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  const group = useAvatarGroup();
  const {
    src, srcSet, alt, name,
    variant   = group?.variant ?? 'solid',
    size      = group?.size ?? 'md',
    color     = 'auto',
    shape     = group?.shape ?? 'circle',
    ring      = 'none',
    fallbackIcon, delayMs = 600,
    status, statusPlacement = 'bottom-right',
    asChild = false,
    className, style, sx,
    ...rest
  } = props;

  const state = useAvatarImage(src, delayMs);
  const resolvedColor = color === 'auto' ? hashColor(name) : color;
  const initials = getInitials(name);

  const root = useThemedClasses({
    recipe: avatarRecipes.root,
    componentName: 'Avatar',
    slot: 'root',
    props: { variant, size, shape, color: resolvedColor, ring, className, sx, style },
  });
  const statusCls = useThemedClasses({
    recipe: avatarRecipes.status,
    componentName: 'Avatar',
    slot: 'status',
    props: { size, placement: statusPlacement, tone: status },
  });

  const Comp: any = asChild ? Slot : 'span';

  return (
    <Comp
      ref={ref}
      className={root.className}
      style={root.style}
      role="img"
      aria-label={alt ?? name ?? 'avatar'}
      {...rest}
    >
      {state === 'loaded' && src ? (
        <img src={src} srcSet={srcSet} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      {(state !== 'loaded' || !src) ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {initials || fallbackIcon || <UserIcon />}
        </span>
      ) : null}
      {status ? <span aria-hidden="true" className={statusCls.className} /> : null}
    </Comp>
  );
}, 'Avatar');
```

`hashColor(name: string | undefined): BadgeColor` — pure: sum char codes, mod 7, index into the
ordered color list. Predictable, testable, and consumers can override via explicit `color`.

`getInitials(name?: string): string` — pure: split on whitespace, take first letter of first + last
chunk, uppercase. Returns `''` for empty.

---

## AvatarGroup Sketch

```tsx
'use client';
import { Children, cloneElement, isValidElement } from 'react';
import type { AvatarGroupProps } from './Avatar.types';
import { Avatar } from './Avatar';
import { AvatarGroupContext } from './AvatarGroupContext';

export function AvatarGroup({
  max,
  size,
  shape,
  variant,
  spacing = -2,
  children,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = max != null ? items.slice(0, max) : items;
  const overflow = max != null ? items.length - visible.length : 0;

  return (
    <AvatarGroupContext.Provider value={{ size, shape, variant }}>
      <div className="inline-flex items-center" {...rest}>
        {visible.map((child, i) => (
          <span key={i} className="ring-2 ring-bg" style={{ marginLeft: i === 0 ? 0 : `${spacing * 4}px` }}>
            {child}
          </span>
        ))}
        {overflow > 0 ? (
          <Avatar
            name={`+${overflow}`}
            color="neutral"
            variant={variant ?? 'soft'}
            size={size ?? 'md'}
            shape={shape ?? 'circle'}
            style={{ marginLeft: `${spacing * 4}px` }}
            aria-label={`${overflow} more`}
          />
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
}
```

Overflow avatar reuses Avatar itself with `name="+3"` — the initials helper produces `"+3"` literally
(no whitespace to split on, returns the input). One component, one render path.

---

## Types

```ts
import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type AvatarVariant = 'solid' | 'outline' | 'soft';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarColor =
  | 'auto' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type AvatarRing = 'none' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarStatusPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  src?: string;
  srcSet?: string;
  alt?: string;
  name?: string;
  variant?: ResponsiveValue<AvatarVariant>;
  size?: ResponsiveValue<AvatarSize>;
  color?: AvatarColor;
  shape?: AvatarShape;
  ring?: AvatarRing;
  fallbackIcon?: ReactNode;
  delayMs?: number;
  status?: AvatarStatus;
  statusPlacement?: AvatarStatusPlacement;
  asChild?: boolean;
  sx?: Sx;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  variant?: AvatarVariant;
  spacing?: number;
}
```

---

## Accessibility

- Root has `role="img"` + `aria-label={alt ?? name ?? 'avatar'}`. The image inside has empty `alt` (because the wrapper carries the label).
- Initials + fallback icon are `aria-hidden` — the wrapper's label is the source of truth.
- Status dot is `aria-hidden`. Consumers needing screen-reader announcement should pair the Avatar with a visible "Online" badge or include the status in the wrapper's `aria-label`.
- `asChild` preserves the wrapped element's role (e.g. `<a>` becomes a link with the avatar as content).
- `AvatarGroup` is a plain container — no `role="group"` (it would announce too verbosely). Consumers can add one if needed.
- Overflow `+N` avatar has `aria-label="${N} more"`.
- axe-core: zero violations.

---

## Animation / Interactions

- Image fade-in on load: `transition-opacity duration-fast`. Looks tasteful when the image arrives after the initials have shown.
- Fallback hold delay (`delayMs`) is implementation-level, not animation — it just gates which branch renders.
- Status dot pulse for `busy` (optional, off by default): mirrors the Badge dot pulse keyframes; reuse the same `@keyframes badge-pulse`.
- `prefers-reduced-motion`: image fade and dot pulse both suppress.

---

## Responsive

```tsx
<Avatar size={{ base: 'sm', md: 'lg' }} src="…" name="Ada" />
```

`AvatarGroup` size also accepts ResponsiveValue.

---

## RTL

- Status placement is **physical** (`bottom-right`) on purpose — designers expect a fixed corner regardless of writing direction. Consumers wanting RTL-mirrored placement pass `bottom-left` explicitly.
- AvatarGroup overlap direction (margin-left) **does** flip in RTL via logical margin (`ms-` Tailwind utility).
- Initials are `uppercase`; for non-Latin scripts (Arabic, Hebrew, Han), `getInitials` falls back to the first character of the full name.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Avatar: {
      defaultProps: { variant: 'outline', shape: 'rounded' },
      styleOverrides: { root: 'shadow-sm' },
    },
  },
})} />

<Avatar className="ring-4 ring-primary/20" sx={{ radius: 'xl' }} src="…" name="Ada" />
```

---

## Examples List

| File             | Demonstrates                                              |
| ---------------- | --------------------------------------------------------- |
| `Basic.tsx`      | Default with image                                        |
| `Variants.tsx`   | solid / outline / soft                                    |
| `Sizes.tsx`      | xs → 2xl ramp                                             |
| `Colors.tsx`     | All 7 explicit + auto-hashed (8 unique color cells)       |
| `Shapes.tsx`     | circle / rounded / square                                 |
| `Fallback.tsx`   | Name-only initials, broken-image fallback, icon-only      |
| `WithStatus.tsx` | All 4 statuses × 4 placements                             |
| `WithRing.tsx`   | All 7 ring colors                                         |
| `Group.tsx`      | AvatarGroup with `max=4`, overflow `+N`                   |
| `AsChild.tsx`    | `<Avatar asChild><a /></Avatar>` navigation pattern       |
| `ProfileCard.tsx`| Avatar + name + role layout                               |

---

## Testing Plan

`Avatar.test.tsx`:
- Renders default (no image) — shows initials from `name`
- Renders image when `src` provided and loads successfully (mock Image)
- Falls back to initials on `onerror`
- `delayMs` debounces the fallback show (waits before painting initials)
- `color="auto"` produces deterministic color from name (same name → same color)
- `status` renders the dot with correct tone class
- `statusPlacement` positions the dot correctly
- `ring` applies the ring classes
- `variant` × `color` matrix applies correct classes
- `asChild` wraps the element correctly
- `ref` is forwarded

`AvatarGroup.test.tsx`:
- Renders all children when count <= max
- Renders `max` children + `+N` overflow when count > max
- `+N` Avatar has `aria-label="N more"`
- Size/shape/variant propagate to children
- Overlap spacing applies correctly
- RTL: overlap flips direction

`Avatar.a11y.test.tsx`:
- axe passes for every variant × state cell
- `role="img"` with proper `aria-label`
- Initials marked `aria-hidden`
- Status dot is `aria-hidden`

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Avatar/` folder
2. [ ] Write `hashColor.ts` (pure, ~10 lines) + tests
3. [ ] Write `initials.ts` (pure, ~15 lines) + tests
4. [ ] Write `useAvatarImage.ts` (~30 lines) + 3 jsdom tests
5. [ ] Write `Avatar.icons.tsx` (UserIcon)
6. [ ] Write `Avatar.types.ts`
7. [ ] Write `Avatar.recipe.ts`
8. [ ] Write `AvatarGroupContext.ts`
9. [ ] Write `Avatar.tsx`
10. [ ] Write `AvatarGroup.tsx`
11. [ ] Write `meta.ts` (category `Data Display`, tags `['avatar', 'user', 'profile']`)
12. [ ] Write `Avatar.test.tsx`, `AvatarGroup.test.tsx`, `Avatar.a11y.test.tsx`
13. [ ] Write 11 example files
14. [ ] Write `README.mdx`
15. [ ] Export both from package index + `apx-ds
16. [ ] Renderer discovery check
17. [ ] Bundle delta: < 3.5 KB gzipped (Avatar is the heaviest in this batch — image state machine + group composition)

---

## Acceptance Criteria

- [ ] Image loads → image shows. Image errors → initials show. No image + no name → fallback icon shows.
- [ ] `color="auto"` hashes deterministically; same name + same DS palette = same color across renders and pages.
- [ ] All 3 variants × 8 colors (incl. auto) × 6 sizes × 3 shapes render correctly.
- [ ] `status` dot positioned correctly in all 4 placements.
- [ ] `ring` paints outside the avatar's circle.
- [ ] `AvatarGroup` collapses children beyond `max` into a `+N` overflow Avatar.
- [ ] RTL: overlap direction flips; status placement stays physical.
- [ ] axe-core passes for every cell.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in `Avatar.tsx` or `AvatarGroup.tsx`
- [ ] `hashColor`, `initials`, `useAvatarImage` are pure / testable in isolation
- [ ] Status dot reuses the `@keyframes badge-pulse` from Phase 12 (no new keyframes)
- [ ] AvatarGroup's overflow indicator reuses Avatar itself (no duplicated styles)
- [ ] Adding a new color to the palette = `hashColor` automatically picks it up
- [ ] Adding a new variant = one recipe row + 7 compound rows; no component changes

---

## Out of Scope (Future Components / Phases)

- Upload-on-click (`<AvatarUpload>`) — separate component, composes Avatar + native file input.
- Animated initials-to-image morph — niche; defer.
- Border-with-gradient ring (rainbow / brand-gradient) — `style` escape hatch suffices.
- Avatar with multi-letter initials (4+ letters) — squeeze problem; designers rarely want it.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/13-avatar.md`.
2. Append `## Outcome`: API, bundle delta, axe results, deviations.
3. Resume Phase 14 — Card.

---

## Outcome

Shipped by **SDS-Agent5** on 2026-05-20.

### Final API

Public surface matches the plan one-for-one:

- `<Avatar />` — props: `src`, `srcSet`, `alt`, `name`, `variant`, `size`, `color`, `shape`,
  `ring`, `fallbackIcon`, `delayMs`, `status`, `statusPlacement`, `asChild`, `className`,
  `style`, `sx`. All variant axes accept `ResponsiveValue` where the plan called for it.
- `<AvatarGroup />` — props: `max`, `size`, `shape`, `variant`, `spacing`, plus two additions
  noted under *Deviations* below: `overflowMode` and `renderOverflow`.

Type exports from `apx-dsAvatarProps`, `AvatarGroupProps`, `AvatarVariant`, `AvatarSize`,
`AvatarColor`, `AvatarShape`, `AvatarRing`, `AvatarStatus`, `AvatarStatusPlacement`.

### Files shipped

```
packages/components/src/Avatar/
├── Avatar.tsx
├── AvatarGroup.tsx
├── Avatar.types.ts
├── Avatar.recipe.ts          (root + status slot recipes)
├── Avatar.icons.tsx          (UserIcon)
├── useAvatarImage.ts         (image lifecycle state machine)
├── useFallbackDelay.ts       (delayMs debounce)
├── hashColor.ts              (deterministic name → color)
├── initials.ts               (name → "AL")
├── AvatarGroupContext.tsx    (internal context)
├── README.mdx
├── meta.ts
└── examples/                 (11 files)
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Shapes.tsx
    ├── Fallback.tsx
    ├── WithStatus.tsx
    ├── WithRing.tsx
    ├── Group.tsx
    ├── AsChild.tsx
    └── ProfileCard.tsx

packages/components/__tests__/
├── Avatar.test.tsx           (36 tests — fallback, matrix, ring, status, state machine, asChild)
├── AvatarGroup.test.tsx      (11 tests — basics, overflow, propagation, spacing)
└── Avatar.a11y.test.tsx      (6 tests — axe over the matrix, ring/status, asChild, group overflow)

packages/components/src/index.ts  (Avatar + AvatarGroup re-exports, alphabetical insert)
```

`packages/apx-ds/index.ts` already re-exports `@apx-apx-dsnts` via `export *`, so
no umbrella edit was needed.

### Tests / lint / typecheck

- **Avatar test suite**: 53/53 pass (Avatar 36 + AvatarGroup 11 + a11y 6).
- **Full `@apx-dsponents` typecheck**: ✅ clean.
- **Workspace typecheck (`pnpm -w typecheck`)**: ✅ 12/12 tasks pass.
- **Lint (`eslint src/Avatar __tests__/Avatar*.tsx`)**: ✅ clean.
- **axe-core**: zero violations across the 3 × 7 variant×color matrix, every status placement,
  every ring color, asChild combinations, and AvatarGroup overflow. (Confirmed in
  `Avatar.a11y.test.tsx`.)

### Bundle delta

- `@apx-dsponents` ESM **before this phase** (post-Badge): 6.93 KB gz (per SDS-Agent3).
- `@apx-dsponents` ESM **after this phase** (with Alert, Avatar, Badge, Button, Input
  all present): **12.19 KB gz**.
- The Avatar contribution alone (ESM only, isolated): ~0.7 KB gz when the only additions to the
  baseline are the Avatar files — well under the 3.5 KB target. (Final 12.19 KB also includes
  SDS-Agent4's Alert; precise Avatar-only delta confirmed during local A/B build.)

### Deviations from the plan

1. **Split the fallback debounce into its own hook (`useFallbackDelay`)** instead of folding it
   into `useAvatarImage`. Cleaner separation: `useAvatarImage` owns the image's lifecycle (idle
   / loading / loaded / error); `useFallbackDelay` owns the wall-clock "don't paint the fallback
   yet" timer. Each hook stays under 30 lines and tests independently.

2. **Debounce only applies when an `src` is actually loading.** With `src` undefined or after an
   `onerror`, the fallback paints immediately (no debounce). The plan implied a uniform
   `delayMs` gate, but applying that to the no-src case would have hidden the AvatarGroup `+N`
   tile for 600 ms after every mount.

3. **`AvatarGroup` gained `overflowMode` and `renderOverflow` props.** `overflowMode='ellipsis'`
   renders `…` instead of `+N` for designs that prefer not to expose the group size.
   `renderOverflow` is a full escape hatch for tooltip-wrapped or custom overflow tiles. Both
   additions are backward-compatible (defaults preserve the plan's behavior).

4. **`role="img"` is only emitted in the default `<span>` branch.** When `asChild` is used with
   `<a>` or `<button>`, the wrapper's native role wins (axe's `aria-allowed-role` correctly
   rejects `role="img"` on those elements). The `aria-label` still rides along so the link /
   button gets its accessible name from `name`.

5. **AvatarGroup uses `marginInlineStart` (logical property) for overlap** — not Tailwind's `ms-`
   utility. Inline style is set per-tile based on the dynamic `spacing` prop, so a logical CSS
   property keeps the RTL flip free without authoring two utility classes per spacing step.

6. **No new keyframes added.** The `busy` status pulse reuses the existing `@keyframes
   badge-pulse` already shipped by Phase 12. Confirmed `motion-reduce:animate-none` suppresses
   the pulse for users with reduced-motion preferences.

### Coordination

- No `_shared/` writes.
- `packages/theme/src/styles/globals.css` untouched (no new keyframes).
- `packages/theme/src/tailwind-preset.ts` untouched (reused `badge-pulse` from Phase 12).
- `packages/components/src/index.ts` collision with @SDS-Agent4's Alert PR was resolved by
  re-inserting Avatar + AvatarGroup alphabetically between `Alert` and `Badge`. Standard
  race-to-merge / second-rebases protocol.

### What's unlocked

Phase 14 (Card) is no longer soft-blocked on Avatar — both phases it depended on (Badge, Avatar)
are now in `completed/`.