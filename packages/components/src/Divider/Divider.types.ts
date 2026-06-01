import type { CSSProperties, ElementType, ReactNode, Ref } from 'react';
import type { Sx } from '@apx-ui/engine';

/** Axis along which the rule runs. */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Border-style of the rule. Maps 1:1 onto Tailwind's `border-{solid|dashed|dotted}`. */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/** Rule width in pixels. Finite enum to avoid sub-pixel rendering surprises. */
export type DividerThickness = 1 | 2 | 4;

/**
 * Token-mapped color. Each name resolves to a `--sds-palette-border-*` variable so a theme
 * swap retints every divider at once.
 */
export type DividerColor = 'subtle' | 'default' | 'strong';

/** Where the label sits along the rule when children are present. */
export type DividerLabelPosition = 'start' | 'center' | 'end';

export interface DividerProps {
  /** Axis. @default 'horizontal' */
  orientation?: DividerOrientation;
  /** @default 'solid' */
  variant?: DividerVariant;
  /** @default 1 */
  thickness?: DividerThickness;
  /** @default 'subtle' */
  color?: DividerColor;
  /** Where the label sits when `children` is non-empty. @default 'center' */
  labelPosition?: DividerLabelPosition;
  /**
   * When `true`, the divider is announced as `role="presentation"` (or `aria-hidden`) — use it
   * when a surrounding region already conveys the section boundary semantically.
   * @default false
   */
  decorative?: boolean;
  /**
   * Override the rendered element. Defaults to `<hr>` when no children, `<div role="separator">`
   * when children are present (because `<hr>` cannot contain content).
   */
  as?: ElementType;
  /** Optional inline label. When present, the rendered element switches to a wrapping `<div>`. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Theme-aware inline style. */
  sx?: Sx;
  /** Forwarded ref. Type is `unknown` because `as` makes the element variable. */
  ref?: Ref<HTMLElement>;
  /**
   * Escape hatch for ARIA when consumers need a different `role` (e.g. `role="menuitem"`-adjacent
   * usage). Defaults to native `<hr>` semantics or `role="separator"` for labeled dividers.
   */
  role?: string;
  /** ARIA orientation override. Set automatically when `orientation="vertical"`. */
  'aria-orientation'?: 'horizontal' | 'vertical';
  /** Pass through `aria-hidden` (e.g. when `decorative` semantics need explicit hiding). */
  'aria-hidden'?: boolean | 'true' | 'false';
}