import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual chrome for the tooltip surface.
 *
 * - `solid`     — opaque fill (color × text-contrast). The conventional tooltip look.
 * - `outline`   — paper background with a 1px colored border + colored text. Brand-aligned hints.
 * - `soft`      — subtle tinted background + colored text + low-contrast colored border.
 * - `inverted`  — platform-style "dark in light mode / light in dark mode". Ignores `color`.
 */
export type TooltipVariant = 'solid' | 'outline' | 'soft' | 'inverted';

export type TooltipSize = 'sm' | 'md' | 'lg';

export type TooltipColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * 12 placements: 4 sides × 3 alignments. Floating UI's vocabulary; logical (`*-start` / `*-end`)
 * so RTL handling falls out of the engine's direction-aware flip middleware.
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/**
 * The `<Tooltip />` props shape. `content` is the floating message; `children` is the **single
 * trigger element** which Tooltip clones to attach `ref` + ARIA + pointer / focus handlers.
 *
 * `Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'color'>` strips the conflicting native props
 * (HTMLDivElement carries `color: string`; Tooltip needs the palette role enum). Extra DOM
 * attributes spread to the floating element.
 */
export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'color' | 'children'> {
  /** The hint text or rich content rendered inside the floating surface. */
  content: ReactNode;
  /**
   * The trigger. Must be a single React element — Tooltip clones it to attach the position ref,
   * pointer / focus handlers, and `aria-describedby` while open. Wrap multi-element triggers in
   * a `<span>` first.
   */
  children: ReactElement;

  /** Visual chrome. Default: `'solid'`. */
  variant?: ResponsiveValue<TooltipVariant>;
  /** Size scale. Default: `'md'`. */
  size?: ResponsiveValue<TooltipSize>;
  /**
   * Palette role. Ignored when `variant === 'inverted'` (the inverted variant has a fixed
   * dark/light contrast palette). Default: `'neutral'`.
   */
  color?: ResponsiveValue<TooltipColor>;

  /** Preferred placement; Floating UI's `flip` middleware may swap to the opposite side. */
  placement?: ResponsiveValue<TooltipPlacement>;
  /** Px gap between the trigger edge and the tooltip surface. Default: `6`. */
  offset?: number;
  /** Render an arrow that points back at the trigger. Default: `true`. */
  showArrow?: boolean;

  /**
   * Hover-in delay in ms. Filters out accidental sweeps across the UI; matches MUI / Radix UX
   * research findings on attention thresholds. Default: `400`.
   */
  openDelay?: number;
  /**
   * Hover-out delay in ms. The close timer is cancelled when the cursor enters the tooltip
   * surface itself, letting users move from trigger to tooltip without it vanishing.
   * Default: `150`.
   */
  closeDelay?: number;

  /** Controlled `open`. When omitted, the tooltip manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /** Notified whenever the `open` value changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;

  /**
   * When `true`, the tooltip never opens. The trigger renders normally (no ref forwarding, no
   * pointer / focus handlers) so consumers can re-use the same prop to "disable hint" without
   * re-mounting the trigger element.
   */
  disabled?: boolean;
  /**
   * Override the portal target. `null` and `undefined` both fall back to `document.body`. Pass
   * a ref'd modal body when nesting tooltips inside an overlay so they don't appear above it.
   */
  portalContainer?: HTMLElement | null | undefined;

  /** Theme-aware inline style object. Merged after the recipe's `style`. */
  sx?: Sx | undefined;
  /** Inline style on the floating surface. Merged after recipe + sx + Floating UI's positioning styles. */
  style?: CSSProperties | undefined;
}
