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
 * Visual chrome for the floating panel. HoverCard borrows Popover's three-variant axis directly —
 * users naturally cluster the two overlays into one mental model ("rich panel anchored to a
 * trigger"), and shipping a divergent vocabulary would invite consumer churn for no real
 * differentiation. The subtle visual delta (HoverCard ships with arrow on by default; Popover
 * with arrow off) carries the personality difference.
 *
 * - `solid`   — paper background + neutral border. **Default.** Generic floating panel.
 * - `outline` — paper background + 1px colored border. Brand-aligned hover cards.
 * - `soft`    — subtle tinted background + low-opacity colored border.
 */
export type HoverCardVariant = 'solid' | 'outline' | 'soft';

export type HoverCardSize = 'sm' | 'md' | 'lg';

export type HoverCardColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Reuse Tooltip's placement vocabulary, same as Popover does. Single canonical placement enum
 * across the overlay family; if Tooltip ever extends it, HoverCard picks it up for free.
 */
export type HoverCardPlacement = TooltipPlacement;

/**
 * Trigger interaction mode. `hover` is hover-only (mouse-driven UX); `hover-focus` opens on focus
 * too so keyboard users can reach hover-card content. `hover-focus` is the **default** because
 * hover-only triggers are inaccessible.
 */
export type HoverCardTrigger = 'hover' | 'hover-focus';

/**
 * The root `<HoverCard>` props. Owns timing (`openDelay` / `closeDelay`), trigger mode, and the
 * controllable open state. Visual axes (`variant` / `size` / `color`) live on
 * `<HoverCard.Content>` because they're surface-level decisions.
 */
export interface HoverCardProps {
  /** Controlled `open`. When omitted, the hover card manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /**
   * Notified whenever the `open` value changes. The canonical async-content pattern hooks here:
   * `onOpenChange={(open) => open && fetchUser(id)}` lets you defer the network request until
   * the card actually opens.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Hover-in delay in ms before the card opens. Default: `700`. HoverCard's defaults are
   * deliberately patient (vs Tooltip's 400ms) — these cards are richer / heavier to render and
   * shouldn't fire during incidental cursor sweeps.
   */
  openDelay?: number;
  /** Hover-out delay in ms before the card closes. Default: `300`. */
  closeDelay?: number;

  /**
   * Open-trigger interaction mode. Default: `'hover-focus'`.
   *
   * - `hover-focus` — opens on pointer-enter **or** focus, closes on pointer-leave or blur. The
   *   accessible default for triggers that include keyboard-reachable content.
   * - `hover` — opens on pointer-enter only. Use only when the trigger element is decorative or
   *   non-focusable; consumers must guarantee that the card's content is reachable elsewhere.
   */
  trigger?: HoverCardTrigger;

  /** Default: `true`. Esc closes the topmost HoverCard (escape-stack ordering). */
  closeOnEscape?: boolean;

  children: ReactNode;
}

/**
 * The trigger. Same `asChild` story as Popover: when `asChild` (default) we clone a single child
 * to attach refs + ARIA + handlers; otherwise we render an inline `<button>` wrapping the
 * children. The default is `asChild={true}` because the GitHub-mention / link-preview pattern
 * almost always wraps an existing focusable element (`<a>`, `<Avatar>`, `<Button>`).
 */
export interface HoverCardTriggerProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  asChild?: boolean;
  children: ReactNode;
}

/**
 * The floating surface. Visual axes + placement live here so consumers can target it
 * independently of the root.
 */
export interface HoverCardContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual chrome. Default: `'solid'`. */
  variant?: ResponsiveValue<HoverCardVariant>;
  /** Size scale (drives padding + min/max width). Default: `'md'`. */
  size?: ResponsiveValue<HoverCardSize>;
  /**
   * Palette role. `solid` ignores `color` (paper background); `outline` paints the border, `soft`
   * paints the tinted background + low-opacity border. Default: `'neutral'`.
   */
  color?: ResponsiveValue<HoverCardColor>;
  /** Preferred placement; Floating UI's `flip` middleware may swap to the opposite side. */
  placement?: ResponsiveValue<HoverCardPlacement>;
  /** Px gap between the trigger and the surface. Default: `8`. */
  offset?: number;
  /** Render an arrow pointing back at the trigger. Default: `true` (HoverCard's signature). */
  showArrow?: boolean;
  /**
   * Override the portal target. `null` falls back to `document.body`. Pass a ref'd modal body
   * when nesting HoverCards inside a Modal so they don't render above its overlay.
   */
  portalContainer?: HTMLElement | null | undefined;
  /** Theme-aware inline style object. Merged after the recipe's `style`. */
  sx?: Sx | undefined;
  /** Inline style. Merged after recipe + sx + Floating UI's positioning styles. */
  style?: CSSProperties | undefined;
}

/** Optional SVG arrow pointing back at the trigger (mirrors `<PopoverArrow>`). */
export interface HoverCardArrowProps extends HTMLAttributes<SVGSVGElement> {
  /** Inline style. Merged after recipe `style`. */
  style?: CSSProperties | undefined;
}

/**
 * Internal context shape exported so the subpart files can type their `useContext` consumers.
 * Mirrors Popover's positioning-reference pattern (the bug-fix architecture from the renderer
 * positioning regression): Floating UI's `setReference` is registered through a mutable ref so
 * the trigger node always reaches the positioning engine the moment it mounts, regardless of the
 * Trigger / Content commit order.
 */
export interface HoverCardContextValue {
  open: boolean;
  /** Schedule open/close — called by Trigger event handlers (no immediate effect). */
  scheduleOpen: () => void;
  scheduleClose: () => void;
  /** Cancel the pending close timer — used by the bridge handler on Content. */
  cancelClose: () => void;
  /** Force-close immediately. Used by Esc + the bridge `onPointerLeave`. */
  closeImmediately: () => void;
  /** Open-trigger mode (read by Trigger to gate focus/blur handlers). */
  trigger: HoverCardTrigger;
  /** Trigger node ref (callback) — sets `triggerNodeRef.current` and forwards into Floating UI. */
  triggerRef: RefCallback<HTMLElement | null>;
  triggerNodeRef: RefObject<HTMLElement | null>;
  /** Mutable ref carrying Floating UI's `setReference` callback (registered by Content). */
  positionReferenceRef: RefObject<RefCallback<HTMLElement | null> | null>;
  registerPositionReference: (cb: RefCallback<HTMLElement | null> | null) => void;
  contentId: string;
  triggerId: string;
}

/** Compound function type so `Object.assign(Root, …)` in `index.ts` infers correctly. */
export type HoverCardComponent = ((props: HoverCardProps) => ReactElement) & {
  Trigger: (props: HoverCardTriggerProps) => ReactElement;
  Content: (props: HoverCardContentProps) => ReactElement;
  Arrow: (props: HoverCardArrowProps) => ReactElement;
};
