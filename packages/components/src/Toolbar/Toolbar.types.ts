import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Layout axis of the toolbar — drives `role`'s `aria-orientation`, the recipe's `flex-direction`,
 * the keyboard handler's arrow-key mapping, and the auto-orientation logic inside
 * `<Toolbar.Separator>` (which flips perpendicular).
 */
export type ToolbarOrientation = 'horizontal' | 'vertical';

/**
 * Visual chrome variants. Toolbar is structural by design (no per-child styling), so the
 * variants only affect the toolbar container itself.
 *
 * - `default`  — transparent shell; for inline toolbars that sit inside parent surfaces.
 * - `bordered` — 1px border + paper background + rounded corners; a self-contained card-ish chrome.
 * - `floating` — raised shadow + softer border + pill-rounded shell; the "floating action bar"
 *   pattern (e.g. Figma's contextual property bar). Positioning is left to the consumer — the
 *   variant only contributes chrome, not `position: fixed`.
 */
export type ToolbarVariant = 'default' | 'bordered' | 'floating';

/**
 * Size scale. Drives gap between children + a descendant size hint (height of bare `<button>`
 * elements) so iconic Button / Toggle clusters stay rhythmic without the consumer passing
 * `size` to every child. Per-child `size` props always win via specificity.
 */
export type ToolbarSize = 'sm' | 'md' | 'lg';

/** Cross-axis alignment of children within the toolbar. */
export type ToolbarAlign = 'start' | 'center' | 'end';

/**
 * Overflow strategy. `none` lets the toolbar grow / wrap as native flex would; `menu` enables
 * the ResizeObserver-driven reflow that moves trailing items into a `<Menu>` "more actions"
 * dropdown when horizontal space runs short. Off by default (opt-in cost: the observer +
 * Menu code path).
 */
export type ToolbarOverflowStrategy = 'none' | 'menu';

/**
 * Compile-time shape of the data shared with subparts (`Toolbar.Group`, `Toolbar.Separator`,
 * `Toolbar.Spacer`). Kept intentionally small — the heavy lifting (roving tabindex, overflow)
 * lives on the root and never crosses the context boundary.
 */
export interface ToolbarContextValue {
  orientation: ToolbarOrientation;
  size: ToolbarSize;
}

export interface ToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-orientation'> {
  /** @default 'horizontal' */
  orientation?: ResponsiveValue<ToolbarOrientation>;
  /** @default 'default' */
  variant?: ResponsiveValue<ToolbarVariant>;
  /** @default 'md' */
  size?: ResponsiveValue<ToolbarSize>;
  /** Cross-axis alignment of children. @default 'center' */
  align?: ResponsiveValue<ToolbarAlign>;

  /**
   * Overflow strategy. When `'menu'`, the toolbar measures its children via ResizeObserver and
   * collapses trailing items into a `<Menu>` "more actions" dropdown when horizontal space
   * runs out. Vertical toolbars ignore overflow (the parent layout owns vertical space).
   * @default 'none'
   */
  overflow?: ToolbarOverflowStrategy;
  /** ARIA label for the overflow menu trigger. @default 'More actions' */
  overflowLabel?: string;

  /**
   * When `true`, wraps iconic children (Button / Toggle with `aria-label` and no visible text)
   * in `<Tooltip>` showing the aria-label. Off by default to avoid surprising tooltip storms
   * in toolbars that already have visible labels.
   * @default false
   */
  applyTooltips?: boolean;

  /** When `true`, arrow-key navigation wraps from last to first item (and vice versa). @default true */
  loop?: boolean;

  /**
   * **Required.** Accessible name for the toolbar. Dev warning emitted when neither this nor
   * `aria-labelledby` is supplied. axe-core requires it.
   */
  'aria-label'?: string;
  /** Alternative to `aria-label` — references an element ID for the toolbar's name. */
  'aria-labelledby'?: string;

  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /**
   * When provided, the group is announced as a labelled region (`role="group"` +
   * `aria-label`). Leave omitted for purely visual grouping.
   */
  'aria-label'?: string;
  /** Alternative labelling via element ID. */
  'aria-labelledby'?: string;
  /** Optional override of the gap between this group's items. Falls through to the toolbar's `size`. */
  gap?: number | 'px' | 0.5 | 1 | 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface ToolbarSeparatorProps {
  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
  /** Thickness of the rule in px. @default 1 */
  thickness?: 1 | 2;
  /** Color role. @default 'subtle' */
  color?: 'subtle' | 'default' | 'strong';
  ref?: Ref<HTMLDivElement>;
}

export interface ToolbarSpacerProps {
  /**
   * Optional fixed size on the toolbar's main axis (theme spacing scale). When omitted, the
   * spacer is greedy (`flex: 1`) and pushes following items to the logical end.
   */
  size?: 0 | 'px' | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
  ref?: Ref<HTMLDivElement>;
}