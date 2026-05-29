# Phase 45 — `<Timeline />`

> Status: **Pending** · **Tier 2** · Depends on: Phase 5 (Text), Phase 14 (Icon), Phase 38 (Divider — connector), Phase 41 (Stepper — pattern parallel), Phase 27 (I18nProvider — optional)
> Vertical (and optional horizontal) event timeline for audit logs, activity feeds, order tracking, version history.

## Objective

Ship the **`<Timeline />`** primitive — a chronological event display.

Use cases:

- Order-tracking ("Placed → Packed → Shipped → Delivered").
- Audit/activity logs (account changes, deployments, PR events).
- Version history.
- Onboarding milestones (similar to Stepper but for *past* events vs *future steps*).
- Chat-adjacent feeds (with avatars + timestamps).

Timeline overlaps conceptually with Stepper (Phase 41) but differs:

| Aspect           | **Stepper**                                        | **Timeline**                                                    |
| ---------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| Time direction   | Forward-looking (current + remaining)             | Backward-looking (past events, optionally including "now")     |
| Status model     | pending / active / complete / error / loading      | Per-event tone (info / success / warning / danger / neutral)  |
| Interactivity    | Optional clickable steps                          | Read-only by default; optional `onItemClick` for detail expand |
| Content per node | label + description + (active expansion content)  | rich content + timestamp + actor + optional media             |

They share visual DNA (dot/icon column + connector line + content panel) but the data model and semantics diverge — keep them as distinct components.

---

## Public API

```tsx
import { Timeline } from 'apx-ds';

// Prop-driven
<Timeline
  items={[
    { id: '1', icon: <Icon name="git-commit" />, title: 'Initial commit',  timestamp: new Date('2026-05-01') },
    { id: '2', icon: <Icon name="git-merge" />, title: 'Merged PR #42',  timestamp: new Date('2026-05-08'), tone: 'success' },
    { id: '3', icon: <Icon name="alert" />, title: 'Build failed',  timestamp: new Date('2026-05-10'), tone: 'danger', description: 'Linter caught 3 issues' },
    { id: '4', icon: <Icon name="check" />, title: 'Deployed to staging', timestamp: new Date('2026-05-12'), tone: 'success' },
  ]}
/>

// Compound API
<Timeline orientation="vertical">
  <Timeline.Item tone="success" icon={<Icon name="check" />} timestamp={t1}>
    <Timeline.Title>Order placed</Timeline.Title>
    <Timeline.Description>Confirmation sent to ahmad@example.com</Timeline.Description>
  </Timeline.Item>

  <Timeline.Item tone="info" icon={<Icon name="package" />} timestamp={t2}>
    <Timeline.Title>Picked + packed</Timeline.Title>
    <Timeline.Description>Warehouse: Berlin DC-2</Timeline.Description>
  </Timeline.Item>

  <Timeline.Item tone="info" icon={<Icon name="truck" />} timestamp={t3} active>
    <Timeline.Title>In transit</Timeline.Title>
    <Timeline.Description>ETA tomorrow 14:00</Timeline.Description>
  </Timeline.Item>

  <Timeline.Item tone="neutral" icon={<Icon name="home" />} timestamp={null}>
    <Timeline.Title>Out for delivery</Timeline.Title>
  </Timeline.Item>
</Timeline>

// With actor + media (rich activity feed)
<Timeline>
  {events.map((e) => (
    <Timeline.Item key={e.id} icon={<Avatar src={e.actor.avatar} size="sm" />} timestamp={e.at}>
      <Timeline.Title>
        <strong>{e.actor.name}</strong> {e.verb}
      </Timeline.Title>
      <Timeline.Description>{e.body}</Timeline.Description>
      {e.media && <Timeline.Media><img src={e.media} /></Timeline.Media>}
    </Timeline.Item>
  ))}
</Timeline>

// Alternating layout (chronological story-card pattern)
<Timeline layout="alternating">
  …
</Timeline>

// Horizontal (e.g. release roadmap)
<Timeline orientation="horizontal" responsive>
  …
</Timeline>

// Full prop form
<Timeline
  items                        // TimelineItem[] (when not using compound)
  orientation="vertical"       // 'vertical' | 'horizontal'
  layout="single"              // 'single' | 'alternating' (vertical only)
  responsive={false}           // boolean — horizontal collapses to vertical on small screens
  size="md"                    // 'sm' | 'md' | 'lg'
  align="start"                // 'start' | 'center' — content alignment relative to dot column
  showTimestamps={true}        // boolean
  timestampFormat="relative"   // 'relative' | 'absolute' | (t: Date) => string
  locale                       // override I18nProvider locale
  collapsible={false}          // boolean — clicking item collapses description
  onItemClick={(id) => void}   // optional
  className=""
  ref={…}
>
  {/* optional compound children */}
</Timeline>

interface TimelineItem {
  id: string;
  icon?: ReactNode;            // dot column content; defaults to a small filled circle
  title: ReactNode;
  description?: ReactNode;
  timestamp?: Date | string | null;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';   // default 'neutral'
  active?: boolean;            // emphasis (e.g. "current step" — uses pulse animation)
  media?: ReactNode;
  actor?: { name: string; avatar?: string };
}
```

---

## API Decisions

| Decision                                                                | Why                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`tone` enum (5 values) instead of "status"**                          | Stepper uses status (pending/active/complete/error). Timeline uses tone — events are factual, not in-progress.  |
| **`active` flag for emphasis** (separate from tone)                     | Lets "current state" highlight without changing the tone (e.g. "in transit" is `info` + `active`).             |
| **Prop-driven + compound API**                                          | Consistent with Stat / Stepper / EmptyState. Prop-driven for 80% case.                                          |
| **`timestamp` accepts Date / string / null**                            | Strings pass through verbatim ("Yesterday"); Date gets formatted via `Intl.DateTimeFormat` or `Intl.RelativeTimeFormat`; null hides the column. |
| **`timestampFormat` defaults to relative**                             | "5 minutes ago" reads better in activity feeds. Switchable per consumer.                                       |
| **`layout="alternating"` for visual stories**                          | Marketing/about-pages use a zig-zag timeline. Native CSS-only via `nth-child` selectors.                       |
| **`responsive` collapses horizontal → vertical on `<md`**              | Horizontal timelines are visually rich but unusable on mobile.                                                  |
| **Connector line is always shown** (last item omits trailing connector) | One source of visual rhythm. Customizable via `connector` slot if needed.                                       |
| **`media` slot for images / video / embeds**                           | Lets Timeline cover the GitHub-activity-feed pattern without prescribing rendering.                            |
| **Collapsible items are opt-in**                                       | Many feeds want everything always visible; collapsing helps deep history.                                       |

---

## Compound subcomponents

| Subcomponent           | Notes                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `Timeline.Item`        | One event. Carries `tone`, `icon`, `timestamp`, `active`.                              |
| `Timeline.Title`       | Bold first line. `<div>` with semantic role; not `<h3>` to avoid heading-level shock.  |
| `Timeline.Description` | Muted body text.                                                                       |
| `Timeline.Media`       | Renders below description; constrained max-width per size.                             |
| `Timeline.Connector`   | Override the default connector line (rare; ships when consumers want dashed/colored).  |
| `Timeline.Timestamp`   | Override the auto-formatted timestamp.                                                 |

When compound children are present, the `items` prop is ignored.

---

## File Structure

```
packages/components/src/Timeline/
├── Timeline.tsx
├── Timeline.Item.tsx
├── Timeline.Title.tsx
├── Timeline.Description.tsx
├── Timeline.Media.tsx
├── Timeline.Connector.tsx
├── Timeline.Timestamp.tsx
├── Timeline.context.ts            # orientation + layout + size + showTimestamps
├── Timeline.types.ts
├── Timeline.recipe.ts
├── formatTimestamp.ts             # pure — Date → relative / absolute string
├── Timeline.test.tsx
├── Timeline.a11y.test.tsx
├── formatTimestamp.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── ActivityFeed.tsx          # actors + avatars + verbs (GitHub-style)
    ├── OrderTracking.tsx
    ├── ToneVariants.tsx
    ├── ActiveEmphasis.tsx
    ├── WithMedia.tsx
    ├── AlternatingLayout.tsx
    ├── Horizontal.tsx
    ├── HorizontalResponsive.tsx
    ├── RelativeTimestamps.tsx
    ├── AbsoluteTimestamps.tsx
    ├── CustomTimestamp.tsx
    ├── Collapsible.tsx
    ├── Compound.tsx
    └── ReleaseRoadmap.tsx        # horizontal alternating
```

---

## Recipe sketches

```ts
export const timelineRecipe = cv({
  base: 'relative w-full',
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row overflow-x-auto pb-2 scrollbar-thin',
    },
    layout: {
      single: '',
      alternating: '',
    },
    size: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: { orientation: 'vertical', layout: 'single', size: 'md' },
});

export const timelineItemRecipe = cv({
  base: 'relative grid min-w-0',
  variants: {
    orientation: {
      vertical:   'grid-cols-[auto_1fr] gap-3',
      horizontal: 'grid-rows-[auto_1fr] gap-2 min-w-[200px]',
    },
    layout: {
      single: '',
      alternating: '[&:nth-child(even)]:[direction:rtl] [&:nth-child(even)>*]:[direction:initial]',
    },
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
});

export const timelineDotRecipe = cv({
  base: 'inline-flex items-center justify-center rounded-full shrink-0 z-1',
  variants: {
    size: {
      sm: 'h-5 w-5 [&_svg]:h-3 [&_svg]:w-3',
      md: 'h-6 w-6 [&_svg]:h-3.5 [&_svg]:w-3.5',
      lg: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
    },
    tone: {
      info:    'bg-(--sds-color-info-subtle) text-(--sds-color-info-emphasis) border-2 border-(--sds-color-info-emphasis)',
      success: 'bg-(--sds-color-success-subtle) text-(--sds-color-success-emphasis) border-2 border-(--sds-color-success-emphasis)',
      warning: 'bg-(--sds-color-warning-subtle) text-(--sds-color-warning-emphasis) border-2 border-(--sds-color-warning-emphasis)',
      danger:  'bg-(--sds-color-danger-subtle) text-(--sds-color-danger-emphasis) border-2 border-(--sds-color-danger-emphasis)',
      neutral: 'bg-(--sds-color-surface-muted) text-(--sds-color-text-muted) border-2 border-(--sds-color-border-default)',
    },
    active: {
      true:  'ring-4 ring-(--sds-color-accent-emphasis)/20 animate-pulse motion-reduce:animate-none',
      false: '',
    },
  },
});

export const timelineConnectorRecipe = cv({
  base: 'absolute bg-(--sds-color-border-subtle)',
  variants: {
    orientation: {
      vertical:   'w-px inset-y-0 left-3 -z-0',     // beneath dot column; size-dependent left offset
      horizontal: 'h-px inset-x-0 top-3',
    },
  },
});
```

The connector line is a single absolutely-positioned element drawn from first dot center to last dot center. Per-item `nth-last-child(1)` trims the trailing portion.

---

## `formatTimestamp.ts`

```ts
export interface FormatTimestampOptions {
  value: Date | string | null;
  format: 'relative' | 'absolute' | ((t: Date) => string);
  locale?: string;
  i18nLocale?: string;
  now?: Date;          // injectable for tests
}

export function formatTimestamp({ value, format, locale, i18nLocale, now = new Date() }: FormatTimestampOptions): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof format === 'function') return format(value);

  const loc = locale ?? i18nLocale;

  if (format === 'relative') {
    const diff = (value.getTime() - now.getTime()) / 1000;
    return formatRelative(diff, loc);
  }
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(value);
}

function formatRelative(diffSeconds: number, locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000], ['month', 2_592_000], ['week', 604_800],
    ['day', 86_400], ['hour', 3_600], ['minute', 60], ['second', 1],
  ];
  for (const [unit, sec] of units) {
    if (Math.abs(diffSeconds) >= sec) {
      return rtf.format(Math.round(diffSeconds / sec), unit);
    }
  }
  return rtf.format(0, 'second');
}
```

Pure, deterministic with `now` injection — unit-testable.

---

## A11y

- **Root**: `<ol>` (vertical) or `<ol class="list-none">` with `aria-label` (e.g. "Order timeline"). Required for unambiguous identification.
- **Items**: `<li>`. Use `aria-current="true"` when `active`.
- Dot/icon is `aria-hidden="true"`.
- Connector is `aria-hidden="true"`.
- Title is text only — no heading level injected by default (consumer can wrap in `<h3>` if appropriate).
- Timestamps: `<time dateTime={iso}>{formatted}</time>` — semantic.
- When `collapsible`, the title becomes a `<button>` with `aria-expanded` and `aria-controls` referencing the description.
- axe-core: 0 violations across all modes / variants.

---

## i18n

When wrapped in `<I18nProvider>`, Timeline consumes:

| Key                     | Default (en)               | Notes                                              |
| ----------------------- | -------------------------- | -------------------------------------------------- |
| `timeline.ariaLabel`    | "Timeline"                 | Default root aria-label if consumer doesn't set it |
| `timeline.noTimestamp`  | (empty)                    | Used when timestamp is omitted                     |

Relative timestamps use `Intl.RelativeTimeFormat` which is locale-aware natively (English: "3 days ago"; German: "vor 3 Tagen"; Hebrew/Arabic: locale-correct forms).

Bundles shipped for en / he / ar.

---

## RTL

- Vertical timeline: dot column is on the logical-start side via CSS Grid template columns + logical-property paddings.
- Horizontal timeline: scroll direction logical via `flex-direction: row` (browser-native flip).
- Connector line offset uses `inset-inline-start` (no per-direction code).
- Alternating layout: uses `[direction]` swapping pattern (CSS only).
- Timestamps use locale-aware `Intl` → naturally RTL when locale = he / ar.

---

## Performance

- Stateless except for optional collapsible state per item.
- `formatTimestamp` is called per render; if relative + the page is long-lived, consumers can pass an interval to refresh `now` themselves (out of scope for Timeline).
- Bundle target: **< 4 KB gz** (excluding shared `formatValue` / `formatTimestamp` helpers if they get promoted).

---

## Testing

- Prop-driven + compound APIs produce same DOM.
- Tone × active matrix renders correct dot classes.
- Connector line drawn between all items, omitted after last.
- `layout="alternating"` mirrors odd items.
- `orientation="horizontal"` switches grid template + adds horizontal scroll.
- `responsive` collapses to vertical at `<md`.
- `formatTimestamp` correctness across relative / absolute / function forms (with injectable `now`).
- Collapsible items: title becomes button; `aria-expanded` toggles.
- RTL snapshot tests for vertical + horizontal + alternating.
- i18n bundles flip relative-time strings to he/ar.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<Timeline>` + all subcomponents exported.
- [ ] Vertical + horizontal + alternating layouts work.
- [ ] 5 tones × `active` flag render correctly.
- [ ] `formatTimestamp` covers relative / absolute / function modes via `Intl.RelativeTimeFormat`.
- [ ] Responsive horizontal → vertical collapse at `<md` works.
- [ ] Collapsible items toggle with proper ARIA.
- [ ] i18n bundle for en/he/ar.
- [ ] RTL correct in all orientations.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses Icon, Divider, Avatar (when consumers pass it as icon), Text.
- [ ] `formatTimestamp` is pure + testable; candidate for promotion to engine alongside `formatValue` (Phase 40) if a third consumer emerges.
- [ ] Visual DNA shares some classes with Stepper but the data models / semantics are intentionally distinct — no forced unification.
- [ ] No external date library; pure `Intl`.
- [ ] No new color tokens.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/45-timeline.md`.
2. Outcome notes: bundle delta, decision on promoting `formatTimestamp` to engine.
3. Document the three canonical Timeline patterns: order tracking, activity feed, release roadmap.

---

## Outcome

**Shipped:** Phase 45 `<Timeline />` — the canonical chronological event list. Implemented under `packages/components/src/Timeline/`, surgically exported from the umbrella between `Textarea` and `Toast` (alphabetical).

### Public surface

- `<Timeline />` — prop-driven (`items: TimelineItemData[]`) **and** compound (`<Timeline.Item>` children). Mutually exclusive at runtime: compound mode wins when any item child is present.
- Compound subcomponents — `Timeline.Item`, `Timeline.Title`, `Timeline.Description`, `Timeline.Media`, `Timeline.Timestamp`, `Timeline.Connector`.
- `formatTimestamp` — pure helper, exported from the umbrella for any future consumer (DataGrid totals, audit log primitives).
- Five tones (`info` / `success` / `warning` / `danger` / `neutral`) + `active` emphasis flag, three sizes (`sm` / `md` / `lg`), two orientations (`vertical` / `horizontal`), two layouts (`single` / `alternating` — vertical only), responsive horizontal → vertical collapse at `< md`, optional collapsible disclosure with proper ARIA, locale-aware relative + absolute timestamps via `Intl.RelativeTimeFormat` + `Intl.DateTimeFormat`.

### Files added

```
packages/components/src/Timeline/
├── Timeline.tsx                 (root + all 6 subcomponents in one file)
├── Timeline.context.ts
├── Timeline.recipe.ts           (9 slot recipes — all literal Tailwind utilities)
├── Timeline.types.ts
├── formatTimestamp.ts           (pure Intl wrapper, injectable `now`)
├── meta.ts
├── index.ts
├── README.mdx
└── examples/                    (14 stories — Basic / ActivityFeed / OrderTracking /
                                  ToneVariants / ActiveEmphasis / WithMedia /
                                  AlternatingLayout / Horizontal / HorizontalResponsive /
                                  RelativeTimestamps / AbsoluteTimestamps /
                                  CustomTimestamp / Collapsible / Compound / Sizes)

packages/components/__tests__/
├── Timeline.test.tsx            (21 tests — prop API, compound, orientation,
                                  collapsible disclosure, onItemClick wiring)
├── Timeline.a11y.test.tsx       (12 tests — <ol>/<li> semantics, aria-current,
                                  aria-hidden coverage, aria-expanded/-controls,
                                  <time dateTime>, axe-clean across all modes)
└── formatTimestamp.test.ts      (9 tests — null/invalid/string passthrough,
                                  relative/absolute/function modes, locale fidelity)
```

### Verification

| Check | Result |
| ----- | ------ |
| `pnpm exec eslint src/Timeline` | ✅ 0 errors, 0 warnings |
| `pnpm tsc --noEmit` (Timeline-scoped) | ✅ clean (strict + `exactOptionalPropertyTypes`) |
| `pnpm vitest run` (Timeline files) | ✅ **42 / 42** across 3 files |
| `pnpm build` (tsup ESM + CJS + DTS) | ✅ all three artifacts emitted, 568 KB ESM |
| axe-core (default × 5 tones, active, horizontal, alternating, collapsible, full prop-driven) | ✅ 0 violations across all 6 axe suites |

Workspace-wide `pnpm lint` / `pnpm tsc --noEmit` / `pnpm vitest run` surface pre-existing errors in other agents' WIP (`HoverCard/examples/*`, `Stepper/Stepper.tsx`, `Stepper.test.tsx`, `Toolbar/applyTooltips.tsx`). None touch Timeline; flagged for the respective owners.

### Bundle delta

Measured with `esbuild` minify + treeshake, externalising `react`, `react-dom`, `@apx-ds `lucide-react`. (Timeline doesn't pull `Spinner` / `Divider` / `Stack` so they're not in the dependency closure to externalise.)

- **Timeline marginal cost: 2.97 KB gzipped** (9 022 B raw) — under the < 4 KB target.

### Implementation notes / deviations from plan

- **Single-file component module.** The plan suggested one file per subcomponent (`Timeline.Item.tsx`, `Timeline.Title.tsx`, …). Co-locating them in `Timeline.tsx` saved ~30 % of the recipe-resolution boilerplate and let the closure-shared types stay private. The exported API surface is identical.
- **Connector is a real `<span aria-hidden>` per item**, not an absolutely-positioned line drawn from first dot to last dot. Per-item connectors are easier to hide with `[&:last-child_[data-timeline-connector]]:hidden`, they pick up theme overrides via `useThemedClasses`, and the Tailwind JIT scanner sees every utility literally. Trade-off: a vertical timeline with very unequal item heights will show a gap in the rail (we'd need a different layout primitive to fully resolve that — accepted for V1).
- **Alternating layout uses grid-column reorder**, not the planned `[direction:rtl]` trick. Real grid reordering keeps screen-reader order in document order and stays fully RTL-correct without needing the inner `[direction:initial]` undo.
- **Collapsible state lives in the item, not in a parent map.** Each `<Timeline.Item>` owns its own `expanded` `useState`. Exposed via `TimelineItemContext` so `Timeline.Title` / `.Description` / `.Media` can wire in without prop drilling. Trade-off: there's no `defaultExpanded` per item yet — easy to add when a consumer needs it.
- **No `<I18nProvider>` integration today.** The provider doesn't exist yet (Phase 27 is still pending), so `locale` is taken straight from props. When the provider lands, the change is additive: `Timeline.locale` becomes a per-instance override on top of the context locale. The `formatTimestamp` signature stays.
- **Five tones use palette role tokens** (`bg-{tone}-subtle` + `border-{tone}` + `text-{tone}`) for info/success/warning/danger; neutral falls back to `bg-bg-subtle` / `border-border` / `text-fg-muted` since there's no neutral palette role. Matches the convention Alert / Badge / Stat already established.
- **`active` ring uses `ring-current/20`** so the ring tint follows the tone automatically — no per-tone compound variants needed.

### Follow-ups flagged

- **Promote `formatTimestamp` to `@apx-dsine/intl`** alongside `formatValue` (Phase 40) when a second consumer (DataGrid timestamp columns, audit primitives) emerges.
- **CSS-only Divider that flips orientation responsively** — same Divider-v2 follow-up flagged by Phase 40. Would let `Timeline orientation="horizontal" responsive` get pixel-perfect connector orientation on every breakpoint rather than falling back to the layout-direction default.
- **`defaultExpanded` per `<Timeline.Item>`** — opt-in initial open state when `collapsible`. Add when a consumer requests it.
- **Live "now" tick.** Relative timestamps recalc on every render; for long-lived dashboards a `useNow(interval)` hook in the engine would let consumers refresh "5 minutes ago" → "6 minutes ago" without touching Timeline. Tracked.

