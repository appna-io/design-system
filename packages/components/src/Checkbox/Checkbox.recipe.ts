import { cv } from '@apx-ui/engine';

/**
 * Three-slot recipe for `<Checkbox />`. Each slot has its own `cv` definition and is fed to
 * `useThemedClasses({ slot })` independently so `theme.components.Checkbox.styleOverrides.{root,control,label}`
 * targets the right node.
 *
 * The pattern (root + visual indicator + label) is intentionally re-usable: Switch (Phase 10)
 * and Radio (Phase 11) ship with the same three-slot layout, mirroring this file's structure
 * with their own state-glyph + box-shape decisions.
 *
 * Compound rules are written out flat (not generated) so Tailwind's content scanner sees every
 * utility class literally — generating via `${color}-bg` template literals would produce
 * classes Tailwind silently drops at build time.
 */
export const checkboxRecipes = {
  root: cv({
    base: [
      'group/checkbox inline-flex items-start cursor-pointer select-none align-top',
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
      'relative shrink-0 inline-flex items-center justify-center',
      'border border-border bg-bg-paper text-transparent',
      'transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard',
      'outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      'data-[invalid=true]:border-danger data-[invalid=true]:peer-focus-visible:ring-danger',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        outline: 'border-2',
        soft: '',
      },
      size: {
        sm: 'size-3.5 [&_svg]:size-2.5',
        md: 'size-4 [&_svg]:size-3',
        lg: 'size-5 [&_svg]:size-3.5',
      },
      shape: {
        // Every shape uses a `rounded-*` utility that the Tailwind preset maps to a `--sds-radius-*`
        // CSS variable. That means switching the app-level theme variant (e.g. `katana`, which
        // ships `radius.sm = '4px 0px'` for diagonal corners) flows through automatically — the
        // class string never changes; the var value changes under it.
        //
        // `square` is intentionally `rounded-sm` (not `rounded-xs`) so the variant's design
        // language is *legible* at the 16-pixel control size. With `rounded-xs` (2px), the Katana
        // diagonal is barely perceptible; with `rounded-sm` (4px in default, `4px 0px` in Katana),
        // the variant's signature reads correctly without dominating the box.
        square: 'rounded-sm',
        rounded: 'rounded-md',
        circle: 'rounded-full',
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
      // ── focus-ring color (applies regardless of checked state) ──────────────────────────────
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
      // ── solid (7) — filled bg + colored border + contrast glyph ────────────────────────────
      {
        variant: 'solid',
        color: 'primary',
        class:
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-contrast data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-contrast',
      },
      {
        variant: 'solid',
        color: 'secondary',
        class:
          'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-contrast data-[state=indeterminate]:bg-secondary data-[state=indeterminate]:border-secondary data-[state=indeterminate]:text-secondary-contrast',
      },
      {
        variant: 'solid',
        color: 'success',
        class:
          'data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=checked]:text-success-contrast data-[state=indeterminate]:bg-success data-[state=indeterminate]:border-success data-[state=indeterminate]:text-success-contrast',
      },
      {
        variant: 'solid',
        color: 'warning',
        class:
          'data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=checked]:text-warning-contrast data-[state=indeterminate]:bg-warning data-[state=indeterminate]:border-warning data-[state=indeterminate]:text-warning-contrast',
      },
      {
        variant: 'solid',
        color: 'danger',
        class:
          'data-[state=checked]:bg-danger data-[state=checked]:border-danger data-[state=checked]:text-danger-contrast data-[state=indeterminate]:bg-danger data-[state=indeterminate]:border-danger data-[state=indeterminate]:text-danger-contrast',
      },
      {
        variant: 'solid',
        color: 'info',
        class:
          'data-[state=checked]:bg-info data-[state=checked]:border-info data-[state=checked]:text-info-contrast data-[state=indeterminate]:bg-info data-[state=indeterminate]:border-info data-[state=indeterminate]:text-info-contrast',
      },
      {
        variant: 'solid',
        color: 'neutral',
        class:
          'data-[state=checked]:bg-neutral data-[state=checked]:border-neutral data-[state=checked]:text-neutral-contrast data-[state=indeterminate]:bg-neutral data-[state=indeterminate]:border-neutral data-[state=indeterminate]:text-neutral-contrast',
      },
      // ── outline (7) — transparent bg, colored border + glyph ───────────────────────────────
      {
        variant: 'outline',
        color: 'primary',
        class:
          'data-[state=checked]:border-primary data-[state=checked]:text-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary',
      },
      {
        variant: 'outline',
        color: 'secondary',
        class:
          'data-[state=checked]:border-secondary data-[state=checked]:text-secondary data-[state=indeterminate]:border-secondary data-[state=indeterminate]:text-secondary',
      },
      {
        variant: 'outline',
        color: 'success',
        class:
          'data-[state=checked]:border-success data-[state=checked]:text-success data-[state=indeterminate]:border-success data-[state=indeterminate]:text-success',
      },
      {
        variant: 'outline',
        color: 'warning',
        class:
          'data-[state=checked]:border-warning data-[state=checked]:text-warning data-[state=indeterminate]:border-warning data-[state=indeterminate]:text-warning',
      },
      {
        variant: 'outline',
        color: 'danger',
        class:
          'data-[state=checked]:border-danger data-[state=checked]:text-danger data-[state=indeterminate]:border-danger data-[state=indeterminate]:text-danger',
      },
      {
        variant: 'outline',
        color: 'info',
        class:
          'data-[state=checked]:border-info data-[state=checked]:text-info data-[state=indeterminate]:border-info data-[state=indeterminate]:text-info',
      },
      {
        variant: 'outline',
        color: 'neutral',
        class:
          'data-[state=checked]:border-neutral data-[state=checked]:text-neutral data-[state=indeterminate]:border-neutral data-[state=indeterminate]:text-neutral',
      },
      // ── soft (7) — subtle tint bg + role border + role glyph ───────────────────────────────
      {
        variant: 'soft',
        color: 'primary',
        class:
          'data-[state=checked]:bg-primary-subtle data-[state=checked]:border-primary-border data-[state=checked]:text-primary data-[state=indeterminate]:bg-primary-subtle data-[state=indeterminate]:border-primary-border data-[state=indeterminate]:text-primary',
      },
      {
        variant: 'soft',
        color: 'secondary',
        class:
          'data-[state=checked]:bg-secondary-subtle data-[state=checked]:border-secondary-border data-[state=checked]:text-secondary data-[state=indeterminate]:bg-secondary-subtle data-[state=indeterminate]:border-secondary-border data-[state=indeterminate]:text-secondary',
      },
      {
        variant: 'soft',
        color: 'success',
        class:
          'data-[state=checked]:bg-success-subtle data-[state=checked]:border-success-border data-[state=checked]:text-success data-[state=indeterminate]:bg-success-subtle data-[state=indeterminate]:border-success-border data-[state=indeterminate]:text-success',
      },
      {
        variant: 'soft',
        color: 'warning',
        class:
          'data-[state=checked]:bg-warning-subtle data-[state=checked]:border-warning-border data-[state=checked]:text-warning data-[state=indeterminate]:bg-warning-subtle data-[state=indeterminate]:border-warning-border data-[state=indeterminate]:text-warning',
      },
      {
        variant: 'soft',
        color: 'danger',
        class:
          'data-[state=checked]:bg-danger-subtle data-[state=checked]:border-danger-border data-[state=checked]:text-danger data-[state=indeterminate]:bg-danger-subtle data-[state=indeterminate]:border-danger-border data-[state=indeterminate]:text-danger',
      },
      {
        variant: 'soft',
        color: 'info',
        class:
          'data-[state=checked]:bg-info-subtle data-[state=checked]:border-info-border data-[state=checked]:text-info data-[state=indeterminate]:bg-info-subtle data-[state=indeterminate]:border-info-border data-[state=indeterminate]:text-info',
      },
      {
        variant: 'soft',
        color: 'neutral',
        class:
          'data-[state=checked]:bg-neutral-subtle data-[state=checked]:border-neutral-border data-[state=checked]:text-neutral data-[state=indeterminate]:bg-neutral-subtle data-[state=indeterminate]:border-neutral-border data-[state=indeterminate]:text-neutral',
      },
    ],
    defaultVariants: { variant: 'solid', size: 'md', shape: 'square', color: 'primary' },
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
};
