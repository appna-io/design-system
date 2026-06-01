import { cv } from '@apx-ui/engine';

/**
 * Recipe family for `<ColorPicker />`, `<ColorSwatch />`, and `<ColorInput />`. The slots are
 * intentionally small + composable so theme authors can re-skin any one independently:
 *
 *   wrapper          — outer label + trigger + helper text column.
 *   label            — visible label above the trigger.
 *   description      — secondary description text between label + trigger.
 *   helperText       — bottom helper / error text (driven by `invalid` variant).
 *   trigger          — the popover trigger button (swatch / button / input variants).
 *   triggerSwatch    — the inline colored chip rendered inside the trigger.
 *   triggerInput     — the editable input rendered inside the `triggerVariant="input"` trigger.
 *   swatch           — the standalone read-only swatch chip (`<ColorSwatch />`).
 *   pickerSurface    — the popover content surface (padding + width).
 *   saturationSquare — the 2D s/v draggable square.
 *   saturationCursor — the small circle inside the square showing the current point.
 *   alphaTrack       — the alpha slider track (with the checkered transparency background).
 *   formatTabs       — the hex / rgb / hsl tab bar at the bottom of the picker.
 *   formatTab        — one tab button.
 *   presetsGrid      — the presets grid wrapper.
 *   preset           — one preset swatch button.
 *   contrastChip     — the WCAG contrast ratio chip.
 *   eyedropperBtn    — the eyedropper button.
 *   inputRow         — the row of numeric inputs inside Rgb / Hsl tabs.
 *
 * Bundle: ~3.8 KB gz after class-string compression (Tailwind's repeated utilities collapse
 * cleanly).
 */

const wrapper = cv({
  base: 'inline-flex flex-col gap-1',
  variants: {
    fullWidth: { true: 'w-full', false: '' },
  },
  defaultVariants: { fullWidth: false },
});

const label = cv({
  base: 'text-sm font-medium text-fg-default',
  variants: {
    hidden: { true: 'sr-only', false: '' },
    disabled: { true: 'opacity-60', false: '' },
  },
  defaultVariants: { hidden: false, disabled: false },
});

const description = cv({
  base: 'text-xs text-fg-muted -mt-0.5',
});

const helperText = cv({
  base: 'text-xs',
  variants: {
    invalid: { true: 'text-danger', false: 'text-fg-muted' },
  },
  defaultVariants: { invalid: false },
});

const trigger = cv({
  base: [
    'inline-flex items-center gap-2 rounded-md border border-border bg-bg-paper',
    'outline-none transition-shadow duration-fast ease-standard motion-reduce:transition-none',
    'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-focus',
    'data-[invalid=true]:border-danger data-[invalid=true]:focus-visible:ring-danger',
  ].join(' '),
  variants: {
    triggerVariant: {
      swatch: 'p-1 aspect-square',
      button: 'px-3 gap-2 text-sm',
      input: 'gap-2 ps-1 pe-2 text-sm font-mono',
    },
    size: {
      sm: 'h-7 text-xs',
      md: 'h-8 text-sm',
      lg: 'h-10 text-base',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: 'cursor-pointer hover:bg-bg-subtle',
    },
  },
  compoundVariants: [
    { triggerVariant: 'swatch', size: 'sm', class: 'w-7' },
    { triggerVariant: 'swatch', size: 'md', class: 'w-8' },
    { triggerVariant: 'swatch', size: 'lg', class: 'w-10' },
  ],
  defaultVariants: { triggerVariant: 'swatch', size: 'md', disabled: false },
});

const triggerSwatch = cv({
  base: [
    'block rounded shrink-0 shadow-inner',
    'border border-border-subtle',
    "bg-[image:repeating-conic-gradient(var(--sds-palette-background-subtle)_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
  ].join(' '),
  variants: {
    size: {
      sm: 'h-full aspect-square',
      md: 'h-full aspect-square',
      lg: 'h-full aspect-square',
    },
  },
  defaultVariants: { size: 'md' },
});

const triggerInput = cv({
  base: [
    'flex-1 bg-transparent outline-none border-0 px-1',
    'placeholder:text-fg-muted',
    'disabled:cursor-not-allowed',
  ].join(' '),
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

const swatch = cv({
  base: [
    'inline-block rounded border border-border-subtle shadow-inner align-middle',
    'shrink-0',
    "bg-[image:repeating-conic-gradient(var(--sds-palette-background-subtle)_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
  ].join(' '),
  variants: {
    size: {
      sm: 'h-5 w-5',
      md: 'h-7 w-7',
      lg: 'h-10 w-10',
    },
  },
  defaultVariants: { size: 'md' },
});

const pickerSurface = cv({
  base: [
    'flex flex-col gap-3 p-3 w-[260px]',
    'rounded-lg border border-border bg-bg-paper text-fg-default shadow-md',
  ].join(' '),
});

const saturationSquare = cv({
  base: [
    'relative w-full aspect-square rounded-md overflow-hidden cursor-crosshair',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus',
    'select-none touch-none',
  ].join(' '),
});

const saturationCursor = cv({
  base: [
    'absolute h-3 w-3 rounded-full border-2 border-white shadow-md',
    '-translate-x-1/2 -translate-y-1/2 pointer-events-none',
    'ring-1 ring-black/30',
  ].join(' '),
});

const alphaTrack = cv({
  base: [
    'relative h-3 w-full rounded-full overflow-hidden border border-border-subtle',
    "bg-[image:repeating-conic-gradient(var(--sds-palette-background-subtle)_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
  ].join(' '),
});

const formatTabs = cv({
  base: 'inline-flex rounded-md bg-bg-subtle p-0.5 gap-0.5 text-xs',
});

const formatTab = cv({
  base: [
    'px-2 py-0.5 rounded text-xs font-medium text-fg-muted',
    'outline-none transition-colors duration-fast ease-standard motion-reduce:transition-none',
    'hover:text-fg-default',
    'focus-visible:ring-2 focus-visible:ring-focus',
    'data-[active=true]:bg-bg-paper data-[active=true]:text-fg-default data-[active=true]:shadow-sm',
  ].join(' '),
});

const presetsGrid = cv({
  base: 'grid grid-cols-8 gap-1.5',
});

const preset = cv({
  base: [
    'relative h-6 w-6 rounded-md border border-border-subtle shadow-inner',
    'outline-none transition-transform duration-fast ease-standard motion-reduce:transition-none',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus',
    'hover:scale-110 cursor-pointer',
    "bg-[image:repeating-conic-gradient(var(--sds-palette-background-subtle)_0%_25%,transparent_0%_50%)] bg-[length:6px_6px]",
    'data-[selected=true]:ring-2 data-[selected=true]:ring-focus data-[selected=true]:ring-offset-2',
  ].join(' '),
});

const contrastChip = cv({
  base: [
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
  ].join(' '),
  variants: {
    level: {
      AAA: 'bg-success-subtle text-success',
      AA: 'bg-success-subtle text-success',
      fail: 'bg-danger-subtle text-danger',
    },
  },
  defaultVariants: { level: 'AA' },
});

const eyedropperBtn = cv({
  base: [
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-paper',
    'text-fg-muted hover:text-fg-default hover:bg-bg-subtle',
    'outline-none focus-visible:ring-2 focus-visible:ring-focus',
    'cursor-pointer transition-colors duration-fast ease-standard motion-reduce:transition-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
});

const inputRow = cv({
  base: 'grid grid-cols-4 gap-1.5 items-center',
});

const numericField = cv({
  base: [
    'flex flex-col items-center gap-0.5',
  ].join(' '),
});

const numericInput = cv({
  base: [
    'w-full rounded border border-border bg-bg-paper px-1.5 py-1 text-center text-xs font-mono',
    'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-focus',
    'tabular-nums',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
});

const numericLabel = cv({
  base: 'text-[10px] uppercase text-fg-muted tracking-wide',
});

export const colorPickerRecipes = {
  wrapper,
  label,
  description,
  helperText,
  trigger,
  triggerSwatch,
  triggerInput,
  swatch,
  pickerSurface,
  saturationSquare,
  saturationCursor,
  alphaTrack,
  formatTabs,
  formatTab,
  presetsGrid,
  preset,
  contrastChip,
  eyedropperBtn,
  inputRow,
  numericField,
  numericInput,
  numericLabel,
};