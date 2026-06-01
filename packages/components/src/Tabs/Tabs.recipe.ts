import { cv } from '@apx-ui/engine';

/**
 * Four-slot recipe for `<Tabs />`. Each slot has its own `cv()` definition and is fed to
 * `useThemedClasses({ slot })` independently, so
 * `theme.components.Tabs.styleOverrides.{ root, list, trigger, panel }` targets the right node.
 *
 * The big idea: **the active indicator is a per-trigger `::after` pseudo-element**, not a
 * floating span positioned via `getBoundingClientRect`. Every trigger paints its own bar in
 * the inactive state with `bg-transparent`; in the active state the compound row sets
 * `data-[state=active]:after:bg-<color>`. Because adjacent triggers share a baseline, the
 * visual reads as a sliding bar even though it's actually a crossfade. Zero JS measurement,
 * zero re-layout, SSR-safe, prefers-reduced-motion friendly.
 *
 * All variant × color rows are written out flat so Tailwind's content scanner finds them as
 * literal tokens. Interpolated class strings (`bg-${color}`) disappear from the JIT output.
 */
export const tabsRecipes = {
  root: cv({
    base: 'flex w-full',
    variants: {
      orientation: {
        horizontal: 'flex-col',
        vertical: 'flex-row gap-4',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
  list: cv({
    base: 'relative inline-flex',
    variants: {
      orientation: {
        horizontal: 'flex-row border-b border-border',
        vertical: 'flex-col border-e border-border',
      },
      alignment: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        // `stretch` distributes triggers equally — combined with `fullWidth` it makes a true
        // segmented control. The bracket selector targets immediate children only so nested
        // utility wrappers don't get blown out.
        stretch: '[&>*]:flex-1',
      },
      size: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
      variant: {
        // `solid`, `pills`, `enclosed` opt out of the bottom border that the underline variant
        // depends on — they paint the active state inside the trigger itself (filled bg / pill
        // shape / browser-tab) and a divider underneath would be redundant.
        underline: '',
        solid: 'border-0 bg-bg-subtle p-1 rounded-md gap-1',
        pills: 'border-0 gap-1',
        enclosed: 'border-0 gap-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      alignment: 'start',
      size: 'md',
      variant: 'underline',
      fullWidth: false,
    },
  }),
  trigger: cv({
    base: [
      'relative inline-flex items-center justify-center gap-2',
      'font-medium whitespace-nowrap',
      'transition-colors duration-fast ease-standard',
      'cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed',
      // ::after carries the active indicator for the underline variant. Kept transparent on
      // every variant by default so we don't pay for an off-screen layer when unused.
      'after:absolute after:bg-transparent after:transition-[background-color] after:duration-fast after:ease-standard',
      'motion-reduce:after:transition-none motion-reduce:transition-none',
    ].join(' '),
    variants: {
      variant: {
        // Underline: 2px bar at the bottom (or end in vertical orientation). Position is set
        // in the orientation compound row below so a single trigger recipe handles both axes.
        underline:
          'text-fg-muted hover:text-fg-default after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5',
        // Solid: filled bg in active state, lives inside an inset List container that already
        // paints a subtle base bg + padding (see `list.solid`). Rounded so adjacent triggers
        // visually separate.
        solid: 'text-fg-muted hover:text-fg-default rounded-md',
        // Pills: pill-shaped active state. Idle is `text-fg-default` (not muted) because pills
        // sit on plain bg without a container; muted would read as disabled.
        pills: 'text-fg-default rounded-full',
        // Enclosed: browser-tab feel. Top + side borders + a missing bottom border to "join"
        // the panel. Idle has a transparent border; active gets the real border.
        enclosed:
          'text-fg-muted hover:text-fg-default border border-transparent rounded-t-md -mb-px',
      },
      size: {
        sm: 'px-2.5 py-1.5 text-sm [&_svg]:size-3.5',
        md: 'px-3 py-2 text-sm [&_svg]:size-4',
        lg: 'px-4 py-2.5 text-base [&_svg]:size-5',
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
      orientation: {
        horizontal: '',
        // Vertical orientation: re-aim the ::after bar to sit at the logical end as a 2px
        // vertical strip. `start-auto` clears the underline-row default; `end-[-1px]` lines
        // up against the list's `border-e` divider.
        vertical:
          'after:left-auto after:right-auto after:bottom-auto after:top-0 after:end-[-1px] after:h-auto after:w-0.5',
      },
    },
    compoundVariants: [
      // ── focus-ring color (applied regardless of active state) ─────────────────────────────
      { variant: 'underline', color: 'primary', class: 'focus-visible:ring-primary' },
      { variant: 'underline', color: 'secondary', class: 'focus-visible:ring-secondary' },
      { variant: 'underline', color: 'success', class: 'focus-visible:ring-success' },
      { variant: 'underline', color: 'warning', class: 'focus-visible:ring-warning' },
      { variant: 'underline', color: 'danger', class: 'focus-visible:ring-danger' },
      { variant: 'underline', color: 'info', class: 'focus-visible:ring-info' },
      { variant: 'underline', color: 'neutral', class: 'focus-visible:ring-neutral' },
      { variant: 'solid', color: 'primary', class: 'focus-visible:ring-primary' },
      { variant: 'solid', color: 'secondary', class: 'focus-visible:ring-secondary' },
      { variant: 'solid', color: 'success', class: 'focus-visible:ring-success' },
      { variant: 'solid', color: 'warning', class: 'focus-visible:ring-warning' },
      { variant: 'solid', color: 'danger', class: 'focus-visible:ring-danger' },
      { variant: 'solid', color: 'info', class: 'focus-visible:ring-info' },
      { variant: 'solid', color: 'neutral', class: 'focus-visible:ring-neutral' },
      { variant: 'pills', color: 'primary', class: 'focus-visible:ring-primary' },
      { variant: 'pills', color: 'secondary', class: 'focus-visible:ring-secondary' },
      { variant: 'pills', color: 'success', class: 'focus-visible:ring-success' },
      { variant: 'pills', color: 'warning', class: 'focus-visible:ring-warning' },
      { variant: 'pills', color: 'danger', class: 'focus-visible:ring-danger' },
      { variant: 'pills', color: 'info', class: 'focus-visible:ring-info' },
      { variant: 'pills', color: 'neutral', class: 'focus-visible:ring-neutral' },
      { variant: 'enclosed', color: 'primary', class: 'focus-visible:ring-primary' },
      { variant: 'enclosed', color: 'secondary', class: 'focus-visible:ring-secondary' },
      { variant: 'enclosed', color: 'success', class: 'focus-visible:ring-success' },
      { variant: 'enclosed', color: 'warning', class: 'focus-visible:ring-warning' },
      { variant: 'enclosed', color: 'danger', class: 'focus-visible:ring-danger' },
      { variant: 'enclosed', color: 'info', class: 'focus-visible:ring-info' },
      { variant: 'enclosed', color: 'neutral', class: 'focus-visible:ring-neutral' },
      // ── underline (7) — active = colored text + colored ::after bar ───────────────────────
      {
        variant: 'underline',
        color: 'primary',
        class: 'data-[state=active]:text-primary data-[state=active]:after:bg-primary',
      },
      {
        variant: 'underline',
        color: 'secondary',
        class: 'data-[state=active]:text-secondary data-[state=active]:after:bg-secondary',
      },
      {
        variant: 'underline',
        color: 'success',
        class: 'data-[state=active]:text-success data-[state=active]:after:bg-success',
      },
      {
        variant: 'underline',
        color: 'warning',
        class: 'data-[state=active]:text-warning data-[state=active]:after:bg-warning',
      },
      {
        variant: 'underline',
        color: 'danger',
        class: 'data-[state=active]:text-danger data-[state=active]:after:bg-danger',
      },
      {
        variant: 'underline',
        color: 'info',
        class: 'data-[state=active]:text-info data-[state=active]:after:bg-info',
      },
      {
        variant: 'underline',
        color: 'neutral',
        class: 'data-[state=active]:text-neutral data-[state=active]:after:bg-neutral',
      },
      // ── solid (7) — active = filled bg + contrast text ────────────────────────────────────
      {
        variant: 'solid',
        color: 'primary',
        class: 'data-[state=active]:bg-primary data-[state=active]:text-primary-contrast',
      },
      {
        variant: 'solid',
        color: 'secondary',
        class: 'data-[state=active]:bg-secondary data-[state=active]:text-secondary-contrast',
      },
      {
        variant: 'solid',
        color: 'success',
        class: 'data-[state=active]:bg-success data-[state=active]:text-success-contrast',
      },
      {
        variant: 'solid',
        color: 'warning',
        class: 'data-[state=active]:bg-warning data-[state=active]:text-warning-contrast',
      },
      {
        variant: 'solid',
        color: 'danger',
        class: 'data-[state=active]:bg-danger data-[state=active]:text-danger-contrast',
      },
      {
        variant: 'solid',
        color: 'info',
        class: 'data-[state=active]:bg-info data-[state=active]:text-info-contrast',
      },
      {
        variant: 'solid',
        color: 'neutral',
        class: 'data-[state=active]:bg-neutral data-[state=active]:text-neutral-contrast',
      },
      // ── pills (7) — active = subtle tint bg + role-colored text ───────────────────────────
      {
        variant: 'pills',
        color: 'primary',
        class: 'data-[state=active]:bg-primary-subtle data-[state=active]:text-primary',
      },
      {
        variant: 'pills',
        color: 'secondary',
        class: 'data-[state=active]:bg-secondary-subtle data-[state=active]:text-secondary',
      },
      {
        variant: 'pills',
        color: 'success',
        class: 'data-[state=active]:bg-success-subtle data-[state=active]:text-success',
      },
      {
        variant: 'pills',
        color: 'warning',
        class: 'data-[state=active]:bg-warning-subtle data-[state=active]:text-warning',
      },
      {
        variant: 'pills',
        color: 'danger',
        class: 'data-[state=active]:bg-danger-subtle data-[state=active]:text-danger',
      },
      {
        variant: 'pills',
        color: 'info',
        class: 'data-[state=active]:bg-info-subtle data-[state=active]:text-info',
      },
      {
        variant: 'pills',
        color: 'neutral',
        class: 'data-[state=active]:bg-neutral-subtle data-[state=active]:text-neutral',
      },
      // ── enclosed (7) — active = paper bg + role-colored top border + role text ────────────
      {
        variant: 'enclosed',
        color: 'primary',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-primary',
      },
      {
        variant: 'enclosed',
        color: 'secondary',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-secondary',
      },
      {
        variant: 'enclosed',
        color: 'success',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-success',
      },
      {
        variant: 'enclosed',
        color: 'warning',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-warning',
      },
      {
        variant: 'enclosed',
        color: 'danger',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-danger',
      },
      {
        variant: 'enclosed',
        color: 'info',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-info',
      },
      {
        variant: 'enclosed',
        color: 'neutral',
        class:
          'data-[state=active]:bg-bg-paper data-[state=active]:border-border data-[state=active]:text-neutral',
      },
    ],
    defaultVariants: {
      variant: 'underline',
      size: 'md',
      color: 'primary',
      orientation: 'horizontal',
    },
  }),
  panel: cv({
    base: [
      'data-[state=inactive]:hidden',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'mt-4',
        vertical: 'mt-0 flex-1',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
};