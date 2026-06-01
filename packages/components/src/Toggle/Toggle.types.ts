import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family for `<Toggle>` and `<ToggleGroup.Item>`. Mirrors `<Button>`'s three idle
 * variants — `solid` / `outline` / `ghost` — because a toggle is a button with a pressed-state
 * decoration on top, not a new visual surface.
 *
 * The plan calls out a 4th `soft` variant; we ship the three Button-aligned ones and document
 * the deviation in the Outcome. Adding `soft` would require modifying `buttonRecipe` to keep
 * Button + Toggle visually in sync; that's a Button rewrite the plan explicitly forbids.
 */
export type ToggleVariant = 'solid' | 'outline' | 'ghost';

export type ToggleSize = 'sm' | 'md' | 'lg';

export type ToggleColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Layout direction of a `<ToggleGroup>`. Drives the attached-rounding axis + `aria-orientation`. */
export type ToggleOrientation = 'horizontal' | 'vertical';

/**
 * Standalone toggle — a single button that flips between off/on. Independent of any group;
 * useful for sidebar collapse buttons, "Show/Hide" affordances, or any binary state.
 */
export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'color' | 'children'> {
  /** Controlled pressed state. Pair with `onPressedChange`. */
  pressed?: boolean | undefined;
  /** Uncontrolled initial pressed state. @default false */
  defaultPressed?: boolean | undefined;
  /** Fires when the user toggles the button (controlled + uncontrolled). */
  onPressedChange?: ((pressed: boolean) => void) | undefined;
  /** Stylistic family. @default 'ghost' */
  variant?: ResponsiveValue<ToggleVariant> | undefined;
  /** Size axis (height + padding + icon). @default 'md' */
  size?: ResponsiveValue<ToggleSize> | undefined;
  /** Palette role driving the pressed-state tint. @default 'neutral' */
  color?: ResponsiveValue<ToggleColor> | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Children — typically an icon or short label. Icon-only toggles MUST set `aria-label`. */
  children?: ReactNode;
}

/**
 * Props common to both `<ToggleGroup type="single">` and `<ToggleGroup type="multiple">`.
 * `type`, `value`, `defaultValue`, and `onValueChange` live on the discriminated branches so
 * a `type="multiple"` consumer gets `string[]` inference for `value` automatically.
 */
export interface ToggleGroupPropsBase {
  /** Stylistic family. Pass once at the group level; items inherit. @default 'ghost' */
  variant?: ResponsiveValue<ToggleVariant> | undefined;
  /** Size axis. @default 'md' */
  size?: ResponsiveValue<ToggleSize> | undefined;
  /** Palette role driving the pressed-state tint. @default 'neutral' */
  color?: ResponsiveValue<ToggleColor> | undefined;
  /**
   * When `true`, neighboring items share borders and corner-radii are flattened on inner edges
   * to produce a segmented-control look. Logical properties keep RTL correct for free.
   * @default false
   */
  attached?: boolean | undefined;
  /** Layout direction. @default 'horizontal' */
  orientation?: ToggleOrientation | undefined;
  /** Disable every item. Per-item `disabled` still works for explicit overrides. */
  disabled?: boolean | undefined;
  /** Merged via `tailwind-merge`. */
  className?: string | undefined;
  /** Native inline style. Prefer `sx` for theme tokens. */
  style?: CSSProperties | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Accessible group label. Either `aria-label` or `aria-labelledby` MUST be supplied. */
  'aria-label'?: string | undefined;
  /** Accessible group label by element id. Either `aria-label` or `aria-labelledby` MUST be supplied. */
  'aria-labelledby'?: string | undefined;
  children: ReactNode;
}

/**
 * Discriminated union on `type`:
 *
 *  - `type="single"`: `value` is `string`, `required` opt-in keeps at least one item pressed
 *    (no clear-on-click of the active item). Behaves like `<RadioGroup>`.
 *  - `type="multiple"`: `value` is `string[]`. Each item toggles independently. Behaves like
 *    a checkbox group.
 *
 * `defaultValue` follows the same per-type widening. `onValueChange` receives the appropriately
 * typed payload for the active type.
 */
export type ToggleGroupProps = ToggleGroupPropsBase &
  (
    | {
        type?: 'single' | undefined;
        value?: string | undefined;
        defaultValue?: string | undefined;
        onValueChange?: ((value: string) => void) | undefined;
        /**
         * Single-mode-only: if true, clicking the currently-pressed item is a no-op (one item
         * is always pressed). Default `false` allows toggling off to an empty selection.
         */
        required?: boolean | undefined;
      }
    | {
        type: 'multiple';
        value?: string[] | undefined;
        defaultValue?: string[] | undefined;
        onValueChange?: ((value: string[]) => void) | undefined;
      }
  );

export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'color' | 'children'> {
  /** Unique key identifying this item in the parent's `value`. */
  value: string;
  /** Disable just this item (additive with the parent's `disabled`). */
  disabled?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Children — icon, label, or both. Icon-only items MUST supply `aria-label`. */
  children?: ReactNode;
}

/**
 * Item-position axis used by the attached-styling recipe. The group computes this once per
 * render from the child order and pipes it down via context.
 */
export type ToggleAttachedPosition = 'single' | 'first' | 'middle' | 'last';

/**
 * Context shape carried from `<ToggleGroup>` to its `<ToggleGroup.Item>`s. Exposes only the
 * resolved-at-base values (non-responsive) that each item needs to compute its own classes,
 * plus the imperative `isPressed` / `toggle` helpers from the state machine.
 */
export interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  variant: ToggleVariant;
  size: ToggleSize;
  color: ToggleColor;
  orientation: ToggleOrientation;
  attached: boolean;
  disabled: boolean;
  /** Map item value → 0-based DOM index, used to derive each item's `position`. */
  itemIndexById: Map<string, number>;
  /** Total registered item count, used to compute `last` position. */
  itemCount: number;
  /**
   * True when at least one item is currently pressed. Items in single-mode use this to honor
   * the roving-tabindex contract: when nothing is pressed, the first item is the entry
   * point; once something is pressed, only the pressed item is tabbable.
   */
  hasAnyPressed: boolean;
  /** Active set test. */
  isPressed: (value: string) => boolean;
  /** Toggle a value (single = swap, multiple = add/remove). */
  toggle: (value: string) => void;
  /** Each `<ToggleGroup.Item>` registers itself for keyboard nav + position derivation. */
  registerItem: (value: string, element: HTMLButtonElement | null) => void;
  /** Returns the values of currently-enabled items, in DOM order. */
  getOrderedEnabledValues: () => string[];
  /** Move focus to the item associated with `value`. */
  focusValue: (value: string) => void;
}

/**
 * Wrapper for `<ToggleGroup>`'s root `<div>`. Splits off ARIA props so they can be typed as
 * required-one-of via the inline assertion (we do this at runtime in the component, not at
 * the type level — a more strict `aria-label XOR aria-labelledby` constraint would degrade
 * the consumer DX without catching more than the existing dev warning catches).
 */
export type ToggleGroupRootHTMLAttributes = Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'aria-orientation'
>;