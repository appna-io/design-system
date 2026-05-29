import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/** Edge + background story. Each variant is its own backdrop primitive. */
export type CardVariant = 'outline' | 'solid' | 'elevated' | 'ghost';
/** Drives padding via `CardContext`; subparts read this, not their own prop. */
export type CardSize = 'sm' | 'md' | 'lg';
/** Palette role used for the selection ring + hoverable border tint. Body bg stays neutral. */
export type CardColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
/** Corner radius. `pill` is more pronounced than `rounded`, used for marketing/landing cards. */
export type CardShape = 'rounded' | 'square' | 'pill';
/** Layout direction. `horizontal` puts `Card.Media` at the logical start (auto-flips in RTL). */
export type CardOrientation = 'vertical' | 'horizontal';
/** Justification for `Card.Footer`'s action row. */
export type CardFooterAlign = 'start' | 'center' | 'end' | 'between';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Edge + background style. @default 'outline' */
  variant?: ResponsiveValue<CardVariant> | undefined;
  /** Padding density propagated to every subpart via context. @default 'md' */
  size?: ResponsiveValue<CardSize> | undefined;
  /** Palette role used by `selected` + `hoverable` accents. @default 'neutral' */
  color?: CardColor | undefined;
  /** Corner radius family. @default 'rounded' */
  shape?: CardShape | undefined;
  /** Layout direction — vertical stacks, horizontal puts Media on the side. @default 'vertical' */
  orientation?: ResponsiveValue<CardOrientation> | undefined;
  /** Lifts the card on hover (transform + shadow). Pure cosmetic; does not imply clickability. */
  hoverable?: boolean | undefined;
  /**
   * Makes the whole card a single click target. Wires `role="button"`, `tabIndex=0`, and
   * keyboard activation (Enter / Space) — no need to wrap in `<button>` manually.
   */
  clickable?: boolean | undefined;
  /** Dims the card and blocks pointer events. Adds `aria-disabled` for SR users. */
  disabled?: boolean | undefined;
  /**
   * Visually marks the card as the active item in a multi-select context. Adds a colored ring
   * + `data-selected="true"`. Does not alter focus/role.
   */
  selected?: boolean | undefined;
  /**
   * Radix-style polymorphism. Merges Card's props onto a single child element (e.g. wrap an `<a>`
   * to render an entire-card link). The child's natural role wins (e.g. `link` for `<a>`).
   */
  asChild?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Heading-text slot. Render as a `<div>` by default — pass `<h3>title</h3>` to control level.
   * Omits the native `HTMLAttributes['title']` (tooltip string) on purpose; if a tooltip is
   * needed, pass it via a wrapping element.
   */
  title?: ReactNode;
  /** Subtitle text below the title. Always a sibling, never a heading. */
  subtitle?: ReactNode;
  /** Leading slot (typically `<Avatar>`). Sits at the logical start. */
  avatar?: ReactNode;
  /** Trailing slot (typically `<Button>` or `<Badge>`). Sits at the logical end. */
  action?: ReactNode;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Justification along the inline axis. @default 'end' */
  align?: CardFooterAlign | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source. When set, an `<img>` is rendered inside the media slot. */
  src?: string | undefined;
  /** Image alt text. **Required** when `src` is set — a dev warning fires when missing. */
  alt?: string | undefined;
  /** CSS aspect-ratio for the media tile. Common ratios accepted; any string passes through. */
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | (string & {}) | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface CardDividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/** Internal value passed from `<Card>` to its subparts. Not part of the public API. */
export interface CardContextValue {
  size: CardSize;
  orientation: CardOrientation;
}
