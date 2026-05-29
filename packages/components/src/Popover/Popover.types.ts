import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { TooltipPlacement } from '../Tooltip/Tooltip.types';

/**
 * Visual chrome for the floating panel. Three variants — same shape as Tooltip's variant axis,
 * minus `inverted` (Popovers carry interactive content; the inverted color contract conflicts
 * with focusable `<input>` / `<button>` styling).
 *
 * - `solid`   — paper background + neutral border. **Default.** Generic floating panel.
 * - `outline` — paper background + 1px colored border. Brand-aligned popovers.
 * - `soft`    — subtle tinted background + low-opacity colored border.
 */
export type PopoverVariant = 'solid' | 'outline' | 'soft';

export type PopoverSize = 'sm' | 'md' | 'lg';

export type PopoverColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Reuse Tooltip's placement vocabulary — there's exactly one canonical placement enum across the
 * overlay family (matching Floating UI). Importing the type rather than redeclaring it keeps the
 * vocabulary single-sourced; if Tooltip ever extends the list (e.g. adding diagonal placements)
 * Popover picks it up for free.
 */
export type PopoverPlacement = TooltipPlacement;

/**
 * The root `<Popover>` props. Owns the open state and the close-behavior toggles. The visual
 * axes (`variant` / `size` / `color` / `placement` / `offset` / `showArrow`) live on
 * `<Popover.Content>` because they're surface-level decisions.
 */
export interface PopoverProps {
  /** Controlled `open`. When omitted, the popover manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /** Notified whenever the `open` value changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /**
   * When `true`, the Popover blocks pointer events on the rest of the page via a backdrop and
   * sets `aria-modal="true"` on Content. Use sparingly — `<Modal>` is the right primitive for
   * actual modals; `modal=true` on a Popover is for tactical exceptions (e.g. a complex date
   * picker that needs to capture clicks but isn't full-screen). Default: `false`.
   */
  modal?: boolean;
  /**
   * When `true`, focus is trapped inside `<Popover.Content>` while open and restored to the
   * trigger on close. Default: `true`. Disable for split-panel patterns where Tab should leak
   * back to the page.
   */
  trapFocus?: boolean;
  /** Default: `true`. Esc closes the topmost Popover (escape-stack ordering). */
  closeOnEscape?: boolean;
  /** Default: `true`. Pointerdown outside trigger + content closes the Popover. */
  closeOnOutsideClick?: boolean;
  children: ReactNode;
}

/**
 * The trigger. Tooltip's API has the trigger as raw `children`; Popover splits it because
 * an interactive Popover often needs the trigger to be controllable separately (e.g. an
 * `IconButton` with custom event handlers). The `asChild` flag mirrors Radix:
 *
 *  - `asChild={true}` (default in Popover for ergonomic `<Button>` triggers) — clone the
 *    single child and attach ref + ARIA + onClick to it.
 *  - `asChild={false}` — render an inline `<button type="button">` wrapping the children.
 *    Useful when the children are purely visual (icons, text) and you don't want a wrapper.
 */
export interface PopoverTriggerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  asChild?: boolean;
  children: ReactNode;
}

/**
 * The floating surface. Visual axes + placement live here so `<Popover.Content>` can sit inside
 * a `<Popover.Portal>` (Phase 19's Modal will reuse this shape) and consumers can target
 * `Content`'s class / sx independently of the root.
 */
export interface PopoverContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual chrome. Default: `'solid'`. */
  variant?: ResponsiveValue<PopoverVariant>;
  /** Size scale (drives padding + min/max width). Default: `'md'`. */
  size?: ResponsiveValue<PopoverSize>;
  /**
   * Palette role. `solid` ignores `color` (paper background); `outline` paints the border, `soft`
   * paints the tinted background + low-opacity border. Default: `'neutral'`.
   */
  color?: ResponsiveValue<PopoverColor>;
  /** Preferred placement; Floating UI's `flip` middleware may swap to the opposite side. */
  placement?: ResponsiveValue<PopoverPlacement>;
  /** Px gap between the trigger and the surface. Default: `8`. */
  offset?: number;
  /** Render an arrow pointing back at the trigger. Default: `false` (Popovers are panels). */
  showArrow?: boolean;
  /**
   * Override the portal target. `null` falls back to `document.body`. Pass a ref'd modal body
   * when nesting Popovers inside a Modal so they don't render above its overlay.
   */
  portalContainer?: HTMLElement | null | undefined;
  /**
   * Element to focus when Content mounts. Defaults to the first focusable descendant; if there
   * are none, the Content element itself is focused (carries `tabIndex={-1}`). Pass an explicit
   * ref to focus a specific input ("focus the password field, not the username").
   */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Theme-aware inline style object. Merged after the recipe's `style`. */
  sx?: Sx | undefined;
  /** Inline style. Merged after recipe + sx + Floating UI's positioning styles. */
  style?: CSSProperties | undefined;
}

/** Optional × button rendered in the corner of `<Popover.Content>`. */
export interface PopoverCloseProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Override the icon / label. Defaults to a 14px `<X>` lucide icon. Always carries
   * `aria-label="Close"` unless an explicit `aria-label` is provided in `...rest`.
   */
  children?: ReactNode;
}

/** Optional SVG arrow pointing back at the trigger (mirrors `<TooltipArrow>`). */
export interface PopoverArrowProps extends HTMLAttributes<SVGSVGElement> {
  /** Inline style. Merged after recipe `style`. */
  style?: CSSProperties | undefined;
}

/**
 * Internal context shape. Exported so the subpart files can type their `useContext` consumers
 * without re-declaring the union. Not part of the public API.
 *
 * `positionReferenceRef` is the bridge that fixed the renderer-positioning bug: Floating UI's
 * `setReference` callback (returned by `usePosition` inside `<Popover.Content>`) is registered
 * here so `<Popover.Trigger>` can fan it into the cloned trigger's ref via `mergeRefs`. This
 * eliminates the timing window where the empty-deps `useEffect` previously used to call
 * `setReference` could miss a remount or hydration-order edge case, leaving Floating UI without
 * a reference and the popover stuck at `top: 0; left: 0`.
 */
export interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: RefCallback<HTMLElement | null>;
  triggerNodeRef: RefObject<HTMLElement | null>;
  floatingNodeRef: RefObject<HTMLElement | null>;
  /**
   * Mutable ref carrying Floating UI's `setReference` callback. `<Popover.Content>` registers it
   * via `registerPositionReference`; `<Popover.Trigger>` reads `.current` inside its
   * `mergeRefs` callback so the very latest reference setter is always called when the trigger
   * DOM node mounts (or remounts).
   */
  positionReferenceRef: RefObject<RefCallback<HTMLElement | null> | null>;
  /**
   * Register / clear the position-reference callback. Called by `<Popover.Content>` once on
   * mount (with Floating UI's `setReference`) and `null` on unmount.
   */
  registerPositionReference: (cb: RefCallback<HTMLElement | null> | null) => void;
  contentId: string;
  triggerId: string;
  modal: boolean;
  trapFocus: boolean;
  registerContent: (node: HTMLElement | null) => void;
}

export type PopoverComponent = ((props: PopoverProps) => ReactElement) & {
  Trigger: (props: PopoverTriggerProps) => ReactElement;
  Content: (props: PopoverContentProps) => ReactElement;
  Arrow: (props: PopoverArrowProps) => ReactElement;
  Close: (props: PopoverCloseProps) => ReactElement;
};
