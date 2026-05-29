import { cv } from '@apx-ui/engine';

/**
 * Six-slot recipe for `<Field />`:
 *
 *  - `root`        — the outer `<div>` / `<fieldset>` container; switches axis between vertical
 *    stack (`top` / `floating` / `hidden`) and horizontal row (`start`).
 *  - `labelColumn` — the wrapper that holds label + addon for `start`-positioned layouts; for
 *    other positions it collapses into a `display: contents` wrapper so the label sits inline.
 *  - `label`       — the `<label>` typography: weight, size, invalid color, sr-only when hidden.
 *  - `controlRow`  — the horizontal flex row that holds `startAdornment` + control + `endAdornment`.
 *  - `description` — long-form guidance, sits between label and control.
 *  - `helper`      — short hint below the control; muted text.
 *  - `error`       — replaces helper when present; danger color, inline-flex for the icon prefix.
 *
 * Recipe convention matches the rest of the DS (Stepper / Breadcrumbs / Menu): each slot is its
 * own `cv()` so `theme.components.Field.styleOverrides.{ root, label, … }` can target every node
 * independently. All variant combinations are written out flat — Tailwind's content scanner only
 * finds literal tokens, no interpolated `text-${size}` strings.
 */
export const fieldRecipes = {
  root: cv({
    base: 'flex min-w-0 w-full',
    variants: {
      labelPosition: {
        top: 'flex-col gap-1.5',
        start: 'flex-row items-start gap-3',
        floating: 'relative flex-col gap-0',
        hidden: 'flex-col gap-1.5',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      disabled: {
        true: 'opacity-60 cursor-not-allowed',
        false: '',
      },
      invalid: {
        true: '',
        false: '',
      },
      as: {
        div: '',
        fieldset: 'border-0 m-0 p-0 min-w-0',
      },
    },
    compoundVariants: [
      // Floating mode wants a tighter gap because the label visually overlaps the control.
      { labelPosition: 'floating', size: 'sm', class: 'gap-0' },
      { labelPosition: 'floating', size: 'md', class: 'gap-0' },
      { labelPosition: 'floating', size: 'lg', class: 'gap-0' },
    ],
    defaultVariants: {
      labelPosition: 'top',
      size: 'md',
      disabled: false,
      invalid: false,
      as: 'div',
    },
  }),
  labelColumn: cv({
    base: 'flex flex-col',
    variants: {
      labelPosition: {
        // Horizontal "form row" — label sits in its own fixed-width column on the leading edge.
        // The `pt-1.5` aligns the label baseline with the control's first text row.
        start: 'shrink-0 pt-1.5',
        top: 'contents',
        floating: 'contents',
        hidden: 'contents',
      },
    },
    defaultVariants: { labelPosition: 'top' },
  }),
  label: cv({
    base: 'inline-flex items-center gap-1 font-medium text-fg-default leading-tight select-none',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      invalid: {
        true: 'text-danger',
        false: '',
      },
      disabled: {
        true: 'text-fg-muted',
        false: '',
      },
      hidden: {
        true: 'sr-only',
        false: '',
      },
      floating: {
        true: [
          // Floating label visually overlaps the control then collapses upward when the control
          // has a value or is focused. Pure CSS via `:placeholder-shown` sibling selectors.
          'pointer-events-none absolute inline-flex items-center gap-1 px-1',
          'top-1/2 -translate-y-1/2',
          'start-3 z-10',
          'bg-bg-default',
          'origin-[inline-start_top] transition-transform duration-fast ease-standard',
          'motion-reduce:transition-none',
          // Collapsed state — control is focused or has a value (not :placeholder-shown).
          'has-[~_[data-field-control]_input:focus]:top-0',
          'has-[~_[data-field-control]_input:focus]:scale-90',
          'has-[~_[data-field-control]_input:not(:placeholder-shown)]:top-0',
          'has-[~_[data-field-control]_input:not(:placeholder-shown)]:scale-90',
          'has-[~_[data-field-control]_textarea:focus]:top-0',
          'has-[~_[data-field-control]_textarea:focus]:scale-90',
          'has-[~_[data-field-control]_textarea:not(:placeholder-shown)]:top-0',
          'has-[~_[data-field-control]_textarea:not(:placeholder-shown)]:scale-90',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: { size: 'md', invalid: false, disabled: false, hidden: false, floating: false },
  }),
  controlRow: cv({
    base: 'flex min-w-0 grow items-center gap-2',
    variants: {
      hasStartAdornment: { true: '', false: '' },
      hasEndAdornment: { true: '', false: '' },
    },
    defaultVariants: { hasStartAdornment: false, hasEndAdornment: false },
  }),
  description: cv({
    base: 'leading-snug text-fg-muted',
    variants: {
      size: {
        sm: 'text-[11px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  helper: cv({
    base: 'leading-snug text-fg-muted',
    variants: {
      size: {
        sm: 'text-[11px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  error: cv({
    base: 'inline-flex items-center gap-1 leading-snug text-danger',
    variants: {
      size: {
        sm: 'text-[11px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  requiredIndicator: cv({
    base: 'text-danger select-none',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  optionalIndicator: cv({
    base: 'text-fg-muted font-normal select-none',
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  adornment: cv({
    base: 'inline-flex items-center text-fg-muted shrink-0',
    variants: {
      side: {
        start: '',
        end: '',
      },
    },
    defaultVariants: { side: 'start' },
  }),
};
