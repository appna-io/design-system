import { cv } from '@apx-ui/engine';

/**
 * Card is the DS's first **compound** primitive — one root + five subparts — so the recipe set
 * is a map instead of a single export. Each recipe is single-purpose and consumed via
 * `useThemedClasses({ componentName: 'Card', slot: '<name>' })` so theme `styleOverrides` slot
 * granularly into `root` / `header` / `body` / `footer` / `media` / `divider`.
 *
 * ### Color story
 *
 * `color` deliberately does **not** repaint the body background — Cards are containers, not
 * status pills, and a fully-tinted body crowds out their actual content. Instead, `color` drives
 * two accent rules:
 *
 *   - `hoverable={true}` → tint the border on hover (`hover:border-<color>/50`).
 *   - `selected={true}` → paint a colored selection ring (`ring-2 ring-<color>`).
 *
 * That keeps every Card visually quiet by default and only escalates when the consumer asks for
 * it explicitly. Same DRY discipline as Badge: 14 compound rules (7 colors × 2 accents) written
 * out flat so Tailwind's literal-text scanner can see them.
 */
export const cardRecipes = {
  root: cv({
    base: [
      'group/card relative overflow-hidden',
      'transition-[transform,box-shadow,border-color,background-color] duration-fast ease-standard',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    ].join(' '),
    variants: {
      variant: {
        outline: 'border border-border bg-bg-paper',
        solid: 'border border-transparent bg-bg-subtle',
        elevated: 'border border-transparent bg-bg-paper shadow-md',
        ghost: 'border border-transparent bg-transparent',
      },
      // Size is intentionally empty at the root — padding lives on subparts via context. Keeping
      // the axis declared (rather than dropping it) lets theme overrides hook off `data-size`.
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      shape: {
        rounded: 'rounded-lg',
        square: 'rounded-none',
        pill: 'rounded-2xl',
      },
      orientation: {
        vertical: 'flex flex-col',
        horizontal: 'flex flex-row',
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
      hoverable: {
        true: 'hover:-translate-y-px hover:shadow-md motion-reduce:hover:translate-y-0',
      },
      clickable: {
        true: 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      },
      // `selected` is declared so compound rules can match, even though the class itself comes
      // exclusively from the variant×color compounds below.
      selected: { true: '' },
    },
    compoundVariants: [
      // ── hoverable × color — border tint on hover ────────────────────────────────────────────
      { hoverable: true, color: 'primary', class: 'hover:border-primary/50' },
      { hoverable: true, color: 'secondary', class: 'hover:border-secondary/50' },
      { hoverable: true, color: 'success', class: 'hover:border-success/50' },
      { hoverable: true, color: 'warning', class: 'hover:border-warning/50' },
      { hoverable: true, color: 'danger', class: 'hover:border-danger/50' },
      { hoverable: true, color: 'info', class: 'hover:border-info/50' },
      { hoverable: true, color: 'neutral', class: 'hover:border-fg-muted/40' },

      // ── selected × color — colored ring ─────────────────────────────────────────────────────
      {
        selected: true,
        color: 'primary',
        class: 'ring-2 ring-primary ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'secondary',
        class: 'ring-2 ring-secondary ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'success',
        class: 'ring-2 ring-success ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'warning',
        class: 'ring-2 ring-warning ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'danger',
        class: 'ring-2 ring-danger ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'info',
        class: 'ring-2 ring-info ring-offset-2 ring-offset-bg',
      },
      {
        selected: true,
        color: 'neutral',
        class: 'ring-2 ring-fg-muted ring-offset-2 ring-offset-bg',
      },

      // ── clickable × focus — keep the focus ring color in sync with role ─────────────────────
      { clickable: true, color: 'primary', class: 'focus-visible:ring-primary' },
      { clickable: true, color: 'secondary', class: 'focus-visible:ring-secondary' },
      { clickable: true, color: 'success', class: 'focus-visible:ring-success' },
      { clickable: true, color: 'warning', class: 'focus-visible:ring-warning' },
      { clickable: true, color: 'danger', class: 'focus-visible:ring-danger' },
      { clickable: true, color: 'info', class: 'focus-visible:ring-info' },
      { clickable: true, color: 'neutral', class: 'focus-visible:ring-fg-muted' },

      // ── elevated + hoverable — shadow grows + slight rise on hover ──────────────────────────
      {
        variant: 'elevated',
        hoverable: true,
        class: 'hover:shadow-lg motion-reduce:hover:translate-y-0',
      },
      // ── ghost + hoverable — paper bg appears on hover so the card materializes ──────────────
      {
        variant: 'ghost',
        hoverable: true,
        class: 'hover:bg-bg-paper hover:border-border',
      },
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      shape: 'rounded',
      orientation: 'vertical',
      color: 'neutral',
      hoverable: false,
      clickable: false,
      selected: false,
    },
  }),

  header: cv({
    base: 'flex items-start gap-3',
    variants: {
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: { size: 'md' },
  }),

  body: cv({
    base: 'text-fg-default',
    variants: {
      size: {
        sm: 'px-3 pb-3',
        md: 'px-4 pb-4',
        lg: 'px-6 pb-6',
      },
    },
    defaultVariants: { size: 'md' },
  }),

  footer: cv({
    base: 'flex items-center',
    variants: {
      size: {
        sm: 'p-3 gap-2',
        md: 'p-4 gap-2',
        lg: 'p-6 gap-3',
      },
      align: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: { size: 'md', align: 'end' },
  }),

  media: cv({
    base: 'overflow-hidden bg-bg-subtle',
    variants: {
      orientation: {
        vertical: 'w-full',
        horizontal: 'h-full w-2/5 shrink-0',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),

  divider: cv({
    base: 'h-px w-full border-0 bg-border',
    variants: {},
  }),
};
