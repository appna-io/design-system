import { cv } from '@apx-ui/engine';

/**
 * Seven-slot recipe for `<Stepper />`:
 *   - `root` — the `<ol>` container; switches axis between horizontal / vertical.
 *   - `item` — the per-step `<li>`; lays out indicator + label + (optional) content.
 *   - `interactive` — the optional `<button>` wrapping the indicator + label when steps are clickable.
 *   - `indicator` — the round circle / dot / progress chunk that carries the step glyph.
 *   - `label` — the typography slot above (or beside) the indicator.
 *   - `description` — the secondary line under the label.
 *   - `connector` — the filled track between two indicators.
 *   - `content` — the inline expanded content slot under the active step in vertical mode.
 *
 * Recipe convention matches the rest of the DS (Tabs / Breadcrumbs / Menu): each slot is its
 * own `cv()` so `theme.components.Stepper.styleOverrides.{ root, indicator, … }` can target each
 * node independently. Variant × status combinations are written out flat — Tailwind's content
 * scanner only finds literal tokens, no interpolated `bg-${status}` strings.
 *
 * ## Status paint convention
 *  - `pending`  — soft surface with a 1px inset ring; muted typography. The step the user hasn't
 *    reached yet, painted to recede.
 *  - `active`   — solid primary fill + a 4px `primary-subtle` outer halo. The halo is the focal
 *    affordance instead of a hard ring; it reads as "you are here" without competing with the
 *    rest of the rail.
 *  - `complete` — solid success fill, no border / ring. Quiet and confident; the checkmark glyph
 *    carries the message.
 *  - `error`    — solid danger fill, no border / ring. Same logic as `complete` but for failure.
 *  - `loading`  — same paint as `pending` so the Spinner reads as the focal element inside the
 *    circle (a colored fill would compete with the spinner's motion).
 *
 * ## Connector paint
 * The connector is a filled `bg-*` track (not a border) so the color transitions cleanly between
 * states and so the rail visually "fills in" as the user advances. Connector status mirrors the
 * step **before** it (resolved in `stepStatus.ts`):
 *  - after `pending`  → muted `bg-border` track.
 *  - after `active`   → `bg-primary` (the rail extends out of the current step).
 *  - after `complete` → `bg-success` (the rail behind the user is "filled in").
 *  - after `error`    → `bg-danger` (draws attention to the failure point).
 *
 * No margins between the connector and the adjacent indicators — the indicator's own background
 * sits on top of the rail, so the line reads as a single continuous track passing through every
 * step, rather than a series of floating dashes.
 */
export const stepperRecipes = {
  root: cv({
    base: 'flex list-none m-0 p-0',
    variants: {
      orientation: {
        horizontal: 'flex-row items-start w-full',
        vertical: 'flex-col items-stretch',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: { orientation: 'horizontal', size: 'md' },
  }),
  item: cv({
    base: 'flex shrink-0',
    variants: {
      orientation: {
        horizontal: 'flex-col flex-1 min-w-0',
        vertical: 'flex-row gap-3',
      },
      align: {
        start: 'items-start text-start',
        center: 'items-center text-center',
        end: 'items-end text-end',
      },
    },
    compoundVariants: [
      // Vertical mode keeps the indicator beside its label regardless of `align` — the row is
      // already horizontal so text alignment doesn't apply. Force start so the label/description
      // hug the indicator on the left, matching every other vertical-list pattern in the DS.
      { orientation: 'vertical', align: 'center', class: 'items-start text-start' },
      { orientation: 'vertical', align: 'end', class: 'items-start text-start' },
    ],
    defaultVariants: { orientation: 'horizontal', align: 'center' },
  }),
  interactive: cv({
    base: [
      'inline-flex items-center gap-2 rounded-md',
      'transition-colors duration-fast ease-standard',
      'cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
      'motion-reduce:transition-none',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'flex-col',
        vertical: 'flex-row',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
  indicator: cv({
    base: [
      'relative inline-flex items-center justify-center font-semibold shrink-0 select-none',
      'transition-[background-color,color,box-shadow] duration-normal ease-standard',
      'motion-reduce:transition-none',
    ].join(' '),
    variants: {
      variant: {
        // Numbered: the workhorse — full circle with a 1px inset ring on pending. The inset ring
        // avoids the layout shift you'd get from toggling a real border on/off across states.
        numbered: 'rounded-full',
        dots: 'rounded-full',
        progress: 'rounded-full',
      },
      size: {
        sm: 'h-6 w-6 text-[11px]',
        md: 'h-8 w-8 text-xs',
        lg: 'h-10 w-10 text-sm',
      },
      status: {
        // Soft surface + inset ring; the number reads as "to do" without screaming for attention.
        pending: 'bg-bg text-fg-muted ring-1 ring-inset ring-border',
        // Solid primary fill + 4px `primary-subtle` halo. The halo is the "you are here" gesture —
        // softer than a hard ring, semantically tied to the primary token so it tracks the theme.
        active: 'bg-primary text-primary-contrast ring-4 ring-primary-subtle',
        // Solid success fill, no ring. The checkmark carries the message; an extra ring would
        // double-state the affordance.
        complete: 'bg-success text-success-contrast',
        // Same shape as `complete` but in the danger role. The alert glyph + red fill is loud
        // enough on its own.
        error: 'bg-danger text-danger-contrast',
        // `loading` reuses the pending paint so the spinner glyph sits on a calm surface. A primary
        // fill here would compete with the spinner's motion and read as "active + spinning" which
        // muddles the meaning.
        loading: 'bg-bg text-fg-muted ring-1 ring-inset ring-border',
      },
    },
    compoundVariants: [
      // Dots variant ignores the numeric label and renders as a small filled disc. It's the right
      // pick for compact rails (carousel pagination, mobile checkout) where every pixel of vertical
      // space matters.
      { variant: 'dots', size: 'sm', class: 'h-2 w-2 text-[0px]' },
      { variant: 'dots', size: 'md', class: 'h-3 w-3 text-[0px]' },
      { variant: 'dots', size: 'lg', class: 'h-4 w-4 text-[0px]' },
      // Dots don't need a halo on active — the dot itself reads as the marker. We swap the halo
      // for a gentle scale-up so the active dot still has presence in the rail.
      { variant: 'dots', status: 'active', class: 'ring-0 scale-125' },
      // Progress variant is the same idea as dots but a half-step bigger. The rail communicates
      // position; the chunk just marks "you are here".
      { variant: 'progress', size: 'sm', class: 'h-3 w-3 text-[0px]' },
      { variant: 'progress', size: 'md', class: 'h-4 w-4 text-[0px]' },
      { variant: 'progress', size: 'lg', class: 'h-5 w-5 text-[0px]' },
      { variant: 'progress', status: 'active', class: 'ring-0' },
    ],
    defaultVariants: { variant: 'numbered', size: 'md', status: 'pending' },
  }),
  label: cv({
    base: 'leading-tight transition-colors duration-fast ease-standard motion-reduce:transition-none',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      status: {
        // Pending: muted color, normal weight — receeds into the rail so the active step stands out.
        pending: 'text-fg-muted font-medium',
        // Active: full-contrast color + semibold so the current step is the most visually weighted
        // label in the row. Pairs with the indicator halo to mark "you are here" twice.
        active: 'text-fg-default font-semibold',
        // Complete: default color, medium weight. The checkmark indicator carries the "done"
        // signal; the label just reads as a normal completed step.
        complete: 'text-fg-default font-medium',
        // Error: danger color + semibold. The label has to draw the eye to the failure point.
        error: 'text-danger font-semibold',
        // Loading: same as active so the in-progress step keeps its visual prominence while the
        // spinner replaces the number.
        loading: 'text-fg-default font-semibold',
      },
      orientation: {
        // Horizontal: ~8px gap between indicator and label.
        horizontal: 'mt-2',
        // Vertical: no top margin — the indicator + label sit in a flex-row, gap is owned by item.
        vertical: 'mt-0',
      },
    },
    defaultVariants: { size: 'md', status: 'pending', orientation: 'horizontal' },
  }),
  description: cv({
    base: 'leading-snug text-fg-subtle mt-0.5 transition-colors duration-fast ease-standard motion-reduce:transition-none',
    variants: {
      size: {
        sm: 'text-[11px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  connector: cv({
    // Filled track (not a border). Letting the background do the work means we can transition
    // colors smoothly, the line has no border-collapse quirks across browsers, and we can drop
    // the `mx-1` gap that used to make each connector read as a floating dash. The indicator's
    // own background sits on top, so the rail visually passes "through" every step.
    base: 'transition-colors duration-normal ease-standard motion-reduce:transition-none shrink-0 rounded-full',
    variants: {
      orientation: {
        // Horizontal: 2px tall track that flex-grows to fill the gap between two indicators.
        // `self-start` keeps it at the top of the row; the per-size `mt` compound variant nudges
        // it to the indicator's vertical center.
        horizontal: 'flex-1 self-start h-[2px]',
        // Vertical: 2px wide track. `min-h-[20px]` guarantees a visible segment even when the
        // adjacent step has no description (avoids two indicators touching). Per-size `ms`
        // centers it under the indicator above.
        vertical: 'w-[2px] self-stretch my-1 min-h-[20px]',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      status: {
        pending: 'bg-border',
        active: 'bg-primary',
        complete: 'bg-success',
        error: 'bg-danger',
      },
    },
    compoundVariants: [
      // Horizontal: center the 2px track on each indicator size.
      // For sm (h-6 = 24px): center y = 12, track is 2px → mt = 11
      // For md (h-8 = 32px): center y = 16, track is 2px → mt = 15
      // For lg (h-10 = 40px): center y = 20, track is 2px → mt = 19
      { orientation: 'horizontal', size: 'sm', class: 'mt-[11px]' },
      { orientation: 'horizontal', size: 'md', class: 'mt-[15px]' },
      { orientation: 'horizontal', size: 'lg', class: 'mt-[19px]' },
      // Vertical: align the 2px-wide track with the indicator's horizontal center.
      // For sm (w-6 = 24px): center x = 12, track is 2px → ms = 11
      // For md (w-8 = 32px): center x = 16, track is 2px → ms = 15
      // For lg (w-10 = 40px): center x = 20, track is 2px → ms = 19
      { orientation: 'vertical', size: 'sm', class: 'ms-[11px]' },
      { orientation: 'vertical', size: 'md', class: 'ms-[15px]' },
      { orientation: 'vertical', size: 'lg', class: 'ms-[19px]' },
    ],
    defaultVariants: { orientation: 'horizontal', size: 'md', status: 'pending' },
  }),
  content: cv({
    base: 'mt-2 text-sm text-fg-default',
    variants: {
      size: {
        // Indent matches the indicator width + the item's `gap-3` (12px) so the expanded content
        // sits flush with the label column above it.
        sm: 'ms-9 text-xs',
        md: 'ms-11 text-sm',
        lg: 'ms-13 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
};