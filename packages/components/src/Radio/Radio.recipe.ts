import { cv } from '@apx-ui/engine';

/**
 * Three-slot recipe for `<Radio />` — `root` (the `<label>`), `control` (the outer ring), and
 * `label` (the text). Mirrors the structure Phase 9 (Checkbox) and Phase 10 (Switch) established;
 * the only structural deviation is that the inner filled dot is rendered as the control's
 * `::before` pseudo-element rather than a child span. That keeps the DOM at exactly the same
 * three nodes as Checkbox (label + input + indicator + text) — the dot is purely paint.
 *
 * Why `::before` instead of a `<span class="dot">` child:
 *   - One fewer DOM node per radio. With seven radios on a page that's seven fewer span nodes.
 *   - The compound rules below can express dot color as `data-[state=checked]:before:bg-<color>` —
 *     a Tailwind variant stack that the JIT scanner happily picks up — without arbitrary `[&_…]`
 *     selectors.
 *   - The scale-in animation is a single `transform` on the `::before`, so reduced-motion users
 *     also get the cleanest CSS-only collapse.
 *
 * Every compound row is written out **literally** so Tailwind's content scanner finds the class
 * names. `data-[state=checked]:before:bg-${color}` template strings would be silently dropped at
 * build time.
 */
export const radioRecipes = {
  root: cv({
    base: [
      'group/radio inline-flex items-start cursor-pointer select-none align-top',
      'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    ].join(' '),
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5',
      },
      labelPosition: {
        right: 'flex-row',
        left: 'flex-row-reverse',
      },
    },
    defaultVariants: { size: 'md', labelPosition: 'right' },
  }),
  control: cv({
    base: [
      // Layout — fixed-aspect circle that owns its size so the dot can be a centered ::before.
      'relative shrink-0 inline-flex items-center justify-center rounded-full',
      'border border-border bg-bg-paper',
      'transition-[background-color,border-color,box-shadow] duration-fast ease-standard',
      // Focus ring lands on the *peer*-focused hidden input, so the visible affordance follows
      // keyboard focus exactly. Color is layered in via compoundVariants below.
      'outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      // Invalid state overrides border + focus-ring color regardless of the chosen color role.
      'data-[invalid=true]:border-danger data-[invalid=true]:peer-focus-visible:ring-danger',
      // The dot — rendered as ::before so the markup stays at three nodes. Always present but
      // scaled to 0 when unchecked; scales to 1 on `data-[state=checked]`. Reduced motion users
      // get a snap (no transform animation).
      'before:content-[""] before:block before:rounded-full',
      'before:bg-transparent before:transition-transform before:duration-fast before:ease-standard motion-reduce:before:transition-none',
      'before:scale-0 data-[state=checked]:before:scale-100',
    ].join(' '),
    variants: {
      variant: {
        // `solid` & `soft` keep the default 1px border; `outline` thickens it to 2px so the
        // unchecked → checked transition reads as a familiar "ring fills in" rather than a
        // border-weight change.
        solid: '',
        outline: 'border-2',
        soft: '',
      },
      size: {
        // Co-derived: the dot diameter is intentionally ~55% of the ring diameter, leaving a
        // clean halo regardless of the active variant. Matches Checkbox/Switch sizing rhythm.
        sm: 'size-3.5 before:size-1.5',
        md: 'size-4 before:size-2',
        lg: 'size-5 before:size-2.5',
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
      // ── focus-ring color (always applied, regardless of checked state) ────────────────────
      { variant: 'solid', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'solid', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'solid', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'solid', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'solid', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'solid', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'solid', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      { variant: 'outline', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'outline', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'outline', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'outline', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'outline', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'outline', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'outline', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      { variant: 'soft', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'soft', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'soft', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'soft', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'soft', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'soft', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'soft', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      // ── solid (7) — filled ring + colored border + contrast dot ───────────────────────────
      {
        variant: 'solid',
        color: 'primary',
        class:
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:before:bg-primary-contrast',
      },
      {
        variant: 'solid',
        color: 'secondary',
        class:
          'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:before:bg-secondary-contrast',
      },
      {
        variant: 'solid',
        color: 'success',
        class:
          'data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=checked]:before:bg-success-contrast',
      },
      {
        variant: 'solid',
        color: 'warning',
        class:
          'data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=checked]:before:bg-warning-contrast',
      },
      {
        variant: 'solid',
        color: 'danger',
        class:
          'data-[state=checked]:bg-danger data-[state=checked]:border-danger data-[state=checked]:before:bg-danger-contrast',
      },
      {
        variant: 'solid',
        color: 'info',
        class:
          'data-[state=checked]:bg-info data-[state=checked]:border-info data-[state=checked]:before:bg-info-contrast',
      },
      {
        variant: 'solid',
        color: 'neutral',
        class:
          'data-[state=checked]:bg-neutral data-[state=checked]:border-neutral data-[state=checked]:before:bg-neutral-contrast',
      },
      // ── outline (7) — transparent fill, colored border + colored dot ──────────────────────
      {
        variant: 'outline',
        color: 'primary',
        class: 'data-[state=checked]:border-primary data-[state=checked]:before:bg-primary',
      },
      {
        variant: 'outline',
        color: 'secondary',
        class: 'data-[state=checked]:border-secondary data-[state=checked]:before:bg-secondary',
      },
      {
        variant: 'outline',
        color: 'success',
        class: 'data-[state=checked]:border-success data-[state=checked]:before:bg-success',
      },
      {
        variant: 'outline',
        color: 'warning',
        class: 'data-[state=checked]:border-warning data-[state=checked]:before:bg-warning',
      },
      {
        variant: 'outline',
        color: 'danger',
        class: 'data-[state=checked]:border-danger data-[state=checked]:before:bg-danger',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'data-[state=checked]:border-info data-[state=checked]:before:bg-info',
      },
      {
        variant: 'outline',
        color: 'neutral',
        class: 'data-[state=checked]:border-neutral data-[state=checked]:before:bg-neutral',
      },
      // ── soft (7) — subtle tinted fill + role border + role dot ────────────────────────────
      {
        variant: 'soft',
        color: 'primary',
        class:
          'data-[state=checked]:bg-primary-subtle data-[state=checked]:border-primary-border data-[state=checked]:before:bg-primary',
      },
      {
        variant: 'soft',
        color: 'secondary',
        class:
          'data-[state=checked]:bg-secondary-subtle data-[state=checked]:border-secondary-border data-[state=checked]:before:bg-secondary',
      },
      {
        variant: 'soft',
        color: 'success',
        class:
          'data-[state=checked]:bg-success-subtle data-[state=checked]:border-success-border data-[state=checked]:before:bg-success',
      },
      {
        variant: 'soft',
        color: 'warning',
        class:
          'data-[state=checked]:bg-warning-subtle data-[state=checked]:border-warning-border data-[state=checked]:before:bg-warning',
      },
      {
        variant: 'soft',
        color: 'danger',
        class:
          'data-[state=checked]:bg-danger-subtle data-[state=checked]:border-danger-border data-[state=checked]:before:bg-danger',
      },
      {
        variant: 'soft',
        color: 'info',
        class:
          'data-[state=checked]:bg-info-subtle data-[state=checked]:border-info-border data-[state=checked]:before:bg-info',
      },
      {
        variant: 'soft',
        color: 'neutral',
        class:
          'data-[state=checked]:bg-neutral-subtle data-[state=checked]:border-neutral-border data-[state=checked]:before:bg-neutral',
      },
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'primary' },
  }),
  label: cv({
    base: 'leading-tight select-none',
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  /**
   * Group layout slot — owns the flex direction + gap so `theme.components.RadioGroup
   * .styleOverrides.root` can re-style the container exactly the same way every other DS
   * component lets consumers theme their root. We deliberately keep this in `Radio.recipe.ts`
   * rather than a separate file so the entire Radio pair is one recipe import.
   */
  group: cv({
    base: '',
    variants: {
      orientation: {
        vertical: 'flex flex-col gap-2',
        horizontal: 'inline-flex flex-row flex-wrap gap-4',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),
};