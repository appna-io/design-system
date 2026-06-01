import { cv } from '@apx-ui/engine';

/**
 * Recipes for `<Toggle>` and `<ToggleGroup>`. Four cv() recipes total:
 *
 *  - `toggleGroupRecipe`  — the outer `<div role="radiogroup|group">` (flex direction + gap).
 *  - `toggleRecipe`       — the actual `<button>` surface, with both off and on states encoded
 *                            in compound rows via `data-[state=on]:` Tailwind selectors.
 *  - `toggleAttachedRecipe` — first / middle / last / single corner-radius + negative-margin
 *                              adjustments for segmented control styling.
 *
 * **Why we don't import `buttonRecipe` and concat strings at runtime.** Composing two `cv()`
 * recipes by calling both at render-time and joining the outputs is brittle: variant axes can
 * conflict (Button's `iconOnly` doesn't exist on Toggle; Toggle's pressed compound rules need
 * to win over Button's `solid` background). Writing one focused `toggleRecipe` keeps the
 * variant matrix legible and lets Tailwind's content scanner see every utility literally in
 * source — the same constraint that keeps Button + Badge + Alert flat-rowed.
 *
 * **Variant mapping per state (concise):**
 *
 *  | variant   | off state                                        | on state                                    |
 *  | --------- | ------------------------------------------------ | ------------------------------------------- |
 *  | `ghost`   | transparent, muted text                          | color-subtle bg + color text                |
 *  | `outline` | transparent, color border + color text           | color solid bg + color-contrast text        |
 *  | `solid`   | color-subtle bg, color text (looks "soft" off)   | color solid bg + color-contrast text        |
 *
 * 3 variants × 7 colors = 21 compound rows, written flat.
 *
 * `solid` off uses the subtle tint (not the full color fill) because a toolbar of always-loud
 * buttons reads as noise — the off-state needs to recede so the on-state has visual headroom.
 * For a button that's ALWAYS pressed-looking when off, consumers should reach for the regular
 * `<Button color="primary">` instead — Toggle's job is to *encode a state*.
 */

export const toggleGroupRecipe = cv({
  base: 'isolate',
  variants: {
    orientation: {
      horizontal: 'inline-flex flex-row',
      vertical: 'inline-flex flex-col',
    },
    attached: {
      true: 'gap-0',
      false: 'gap-1',
    },
  },
  defaultVariants: { orientation: 'horizontal', attached: false },
});

export const toggleRecipe = cv({
  base: [
    'inline-flex items-center justify-center gap-2 align-middle',
    'font-medium select-none whitespace-nowrap',
    'rounded-md border border-transparent',
    // The pressed transition stays color-only — animating `transform` here clashes with the
    // CSS-grid Accordion approach we just shipped (parent containers may animate layout) and
    // a scale-down on a pressed toolbar button reads as a "release", which is wrong semantics.
    'transition-[background-color,color,border-color,box-shadow]',
    'duration-fast ease-standard',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-50 disabled:pointer-events-none',
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    // When focused inside an attached group, lift above neighbors so the ring isn't clipped.
    // `data-attached-position` is set by ToggleGroup.Item via context; standalone Toggle uses
    // `single` (rounded all corners, no negative margin, no z-index bump).
    'data-[attached=true]:focus-visible:z-10',
    'data-[attached=true]:focus-visible:relative',
    // Pressed-state semantic font tweak so screen readers reading the visual hierarchy get a
    // weight cue alongside the color shift.
    'data-[state=on]:font-semibold',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: '',
      ghost: '',
    },
    size: {
      sm: 'h-8 px-2.5 text-sm gap-1.5 [&_svg]:size-3.5 min-w-8',
      md: 'h-10 px-3 text-sm gap-2 [&_svg]:size-4 min-w-10',
      lg: 'h-12 px-4 text-base gap-2 [&_svg]:size-5 min-w-12',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
  },
  compoundVariants: [
    // ── ghost × color (7) ────────────────────────────────────────────────────────────────────
    // Off: transparent + role color text muted. On: subtle tint + role text.
    {
      variant: 'ghost',
      color: 'primary',
      class:
        'bg-transparent text-fg-muted hover:bg-primary-subtle hover:text-primary focus-visible:ring-primary data-[state=on]:bg-primary-subtle data-[state=on]:text-primary',
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class:
        'bg-transparent text-fg-muted hover:bg-secondary-subtle hover:text-secondary focus-visible:ring-secondary data-[state=on]:bg-secondary-subtle data-[state=on]:text-secondary',
    },
    {
      variant: 'ghost',
      color: 'success',
      class:
        'bg-transparent text-fg-muted hover:bg-success-subtle hover:text-success focus-visible:ring-success data-[state=on]:bg-success-subtle data-[state=on]:text-success',
    },
    {
      variant: 'ghost',
      color: 'warning',
      class:
        'bg-transparent text-fg-muted hover:bg-warning-subtle hover:text-warning focus-visible:ring-warning data-[state=on]:bg-warning-subtle data-[state=on]:text-warning',
    },
    {
      variant: 'ghost',
      color: 'danger',
      class:
        'bg-transparent text-fg-muted hover:bg-danger-subtle hover:text-danger focus-visible:ring-danger data-[state=on]:bg-danger-subtle data-[state=on]:text-danger',
    },
    {
      variant: 'ghost',
      color: 'info',
      class:
        'bg-transparent text-fg-muted hover:bg-info-subtle hover:text-info focus-visible:ring-info data-[state=on]:bg-info-subtle data-[state=on]:text-info',
    },
    {
      variant: 'ghost',
      color: 'neutral',
      class:
        'bg-transparent text-fg-muted hover:bg-bg-subtle hover:text-fg focus-visible:ring-neutral data-[state=on]:bg-bg-subtle data-[state=on]:text-fg',
    },
    // ── outline × color (7) ──────────────────────────────────────────────────────────────────
    // Off: transparent + role border + role text. On: solid role fill + contrast text + role border.
    {
      variant: 'outline',
      color: 'primary',
      class:
        'bg-transparent text-primary border-primary-border hover:bg-primary-subtle focus-visible:ring-primary data-[state=on]:bg-primary data-[state=on]:text-primary-contrast data-[state=on]:border-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'bg-transparent text-secondary border-secondary-border hover:bg-secondary-subtle focus-visible:ring-secondary data-[state=on]:bg-secondary data-[state=on]:text-secondary-contrast data-[state=on]:border-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'bg-transparent text-success border-success-border hover:bg-success-subtle focus-visible:ring-success data-[state=on]:bg-success data-[state=on]:text-success-contrast data-[state=on]:border-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'bg-transparent text-warning border-warning-border hover:bg-warning-subtle focus-visible:ring-warning data-[state=on]:bg-warning data-[state=on]:text-warning-contrast data-[state=on]:border-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class:
        'bg-transparent text-danger border-danger-border hover:bg-danger-subtle focus-visible:ring-danger data-[state=on]:bg-danger data-[state=on]:text-danger-contrast data-[state=on]:border-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class:
        'bg-transparent text-info border-info-border hover:bg-info-subtle focus-visible:ring-info data-[state=on]:bg-info data-[state=on]:text-info-contrast data-[state=on]:border-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'bg-transparent text-fg border-border hover:bg-bg-subtle focus-visible:ring-neutral data-[state=on]:bg-neutral data-[state=on]:text-neutral-contrast data-[state=on]:border-neutral',
    },
    // ── solid × color (7) ────────────────────────────────────────────────────────────────────
    // Off: subtle tint + role text. On: full role fill + contrast text. The off state reads as
    // "soft" — that's the visual the plan's 4th variant would have shipped if we had it.
    {
      variant: 'solid',
      color: 'primary',
      class:
        'bg-primary-subtle text-primary hover:bg-primary-subtle/80 focus-visible:ring-primary data-[state=on]:bg-primary data-[state=on]:text-primary-contrast',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class:
        'bg-secondary-subtle text-secondary hover:bg-secondary-subtle/80 focus-visible:ring-secondary data-[state=on]:bg-secondary data-[state=on]:text-secondary-contrast',
    },
    {
      variant: 'solid',
      color: 'success',
      class:
        'bg-success-subtle text-success hover:bg-success-subtle/80 focus-visible:ring-success data-[state=on]:bg-success data-[state=on]:text-success-contrast',
    },
    {
      variant: 'solid',
      color: 'warning',
      class:
        'bg-warning-subtle text-warning hover:bg-warning-subtle/80 focus-visible:ring-warning data-[state=on]:bg-warning data-[state=on]:text-warning-contrast',
    },
    {
      variant: 'solid',
      color: 'danger',
      class:
        'bg-danger-subtle text-danger hover:bg-danger-subtle/80 focus-visible:ring-danger data-[state=on]:bg-danger data-[state=on]:text-danger-contrast',
    },
    {
      variant: 'solid',
      color: 'info',
      class:
        'bg-info-subtle text-info hover:bg-info-subtle/80 focus-visible:ring-info data-[state=on]:bg-info data-[state=on]:text-info-contrast',
    },
    {
      variant: 'solid',
      color: 'neutral',
      class:
        'bg-bg-subtle text-fg hover:bg-bg-subtle/80 focus-visible:ring-neutral data-[state=on]:bg-neutral data-[state=on]:text-neutral-contrast',
    },
  ],
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
    color: 'neutral',
  },
});

/**
 * Attached / segmented-control positioning. Driven by the `position` axis (computed by the
 * group from child order) and `orientation`. Inner edges drop their rounded corners; the
 * negative inline-start margin on items 2+ merges adjacent borders into a single 1-px line.
 *
 * Logical properties (`rounded-s-*` / `rounded-e-*` / `-ms-px`) flip in RTL automatically.
 * Vertical attached uses block-start/end rounding + a negative inline-block-start margin.
 */
export const toggleAttachedRecipe = cv({
  variants: {
    orientation: {
      horizontal: '',
      vertical: '',
    },
    position: {
      single: '',
      first: '',
      middle: 'rounded-none',
      last: '',
    },
  },
  compoundVariants: [
    // ── horizontal ───────────────────────────────────────────────────────────────────────────
    { orientation: 'horizontal', position: 'first', class: 'rounded-e-none' },
    { orientation: 'horizontal', position: 'middle', class: '-ms-px' },
    { orientation: 'horizontal', position: 'last', class: 'rounded-s-none -ms-px' },
    // ── vertical ─────────────────────────────────────────────────────────────────────────────
    { orientation: 'vertical', position: 'first', class: 'rounded-b-none' },
    { orientation: 'vertical', position: 'middle', class: '-mt-px' },
    { orientation: 'vertical', position: 'last', class: 'rounded-t-none -mt-px' },
  ],
  defaultVariants: { orientation: 'horizontal', position: 'single' },
});