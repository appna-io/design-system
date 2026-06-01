import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
  RefCallback,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { PopoverPlacement } from '../Popover/Popover.types';

/**
 * Visual chrome for the trigger shell. Same four-variant vocabulary as Input / Textarea — Select
 * IS a form-control, so the form-control variant set applies even though the underlying element
 * is a `<button>` rather than an `<input>`.
 *
 * - `outline`   — 1px border + transparent bg. **Default.** The classic dropdown look.
 * - `solid`     — `bg-<color>-subtle` resting state; pops to paper on focus.
 * - `ghost`     — borderless at rest; gains border + tint on hover/focus (filter-row UX).
 * - `underline` — bottom rule only; minimal chrome.
 */
export type SelectVariant = 'outline' | 'solid' | 'ghost' | 'underline';

export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Reuse Popover's placement vocabulary — every overlay primitive in the DS aliases from this
 * single source. (Menu does the same.)
 */
export type SelectPlacement = PopoverPlacement;

/**
 * Visual chrome for the **listbox surface** (the floating panel). Independent of the trigger's
 * variant axis — the trigger lives in form-control vocab, the content lives in overlay vocab
 * (matching Popover / Menu). 3 variants.
 */
export type SelectContentVariant = 'solid' | 'outline' | 'soft';

/**
 * The root `<Select>` props. Owns the value + open state, the form-control attributes
 * (`name` / `required` / `invalid` / `disabled`), and the visual axes that get propagated to
 * Trigger via context.
 *
 * The visual axes live on the **root**, not on `<Select.Trigger>`, because the consumer rarely
 * wants to mismatch the trigger's variant with the surface it presents. This is the inverse of
 * Popover (where Content owns the axes) and matches the form-control family's "one root, one
 * style" contract.
 */
export interface SelectProps {
  /** Form name. When present, a hidden `<input type="hidden" name value>` participates in form submission. */
  name?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. Default: `''`. */
  defaultValue?: string;
  /** Fires when the value changes (controlled or uncontrolled). */
  onValueChange?: (value: string) => void;
  /** Standard form-control flag — mirrors `<input required>`. Adds `aria-required` to the trigger. */
  required?: boolean;
  /** Visual + a11y invalid state. Drives `aria-invalid` on the trigger + the danger border/ring. */
  invalid?: boolean;
  /** Disables the trigger + skips opening. */
  disabled?: boolean;
  /** Trigger chrome. Default: `'outline'`. */
  variant?: ResponsiveValue<SelectVariant>;
  /** Size axis — Trigger height matches Input/Textarea per size (sm=h-8, md=h-10, lg=h-12). Default: `'md'`. */
  size?: ResponsiveValue<SelectSize>;
  /** Palette role — accents border / ring / bg per the form-control matrix. Default: `'neutral'`. */
  color?: ResponsiveValue<SelectColor>;
  /** Stretch the trigger to fill its container's width. Default: `true`. */
  fullWidth?: ResponsiveValue<boolean>;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Default open state for the listbox. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Fires when the listbox opens / closes. */
  onOpenChange?: (open: boolean) => void;
  /** Explicit id for the trigger; `useFormFieldA11y` generates one if omitted. */
  id?: string;
  /** Default: `true`. Esc closes the listbox. */
  closeOnEscape?: boolean;
  /** Default: `true`. Pointer-down outside trigger + content closes the listbox. */
  closeOnOutsideClick?: boolean;
  children: ReactNode;
}

/**
 * The trigger button. `role="combobox"` with `aria-haspopup="listbox"` per the W3C APG Combobox
 * pattern. Exposes optional `leftIcon` / `rightIcon` slots; the default `rightIcon` is a
 * downward chevron that rotates 180° when the listbox is open.
 *
 * Unlike Popover's Trigger, `Select.Trigger` does not support `asChild` — the form-control wiring
 * (controlBase classes, useFormFieldA11y attrs, ChevronDown rendering) is opinionated and would
 * be awkward to project onto an arbitrary child element. Consumers wanting custom chrome can
 * pass `className` / `sx` instead.
 */
export interface SelectTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Decorative icon at logical start. */
  leftIcon?: ReactNode;
  /** Override the default chevron at logical end. */
  rightIcon?: ReactNode;
  /** Theme-aware inline style. */
  sx?: Sx | undefined;
}

/**
 * The floating listbox surface. Carries its own visual variant axis (separate from the trigger's
 * form-control variant) so consumers can mix a, say, `underline` trigger with a `solid` listbox.
 */
export interface SelectContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual chrome for the listbox panel. Default: `'solid'`. */
  variant?: ResponsiveValue<SelectContentVariant>;
  /** Preferred placement. Default: `'bottom-start'`. */
  placement?: ResponsiveValue<SelectPlacement>;
  /** Px gap between trigger and surface. Default: `4`. */
  offset?: number;
  /**
   * Sync the listbox width to the trigger's width via Floating UI's `size` middleware.
   * Default: `true` (the form-control expectation — the dropdown is the same width as the field).
   */
  matchTriggerWidth?: boolean;
  /** Override the portal target. `null` falls back to `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** Arrow keys wrap at top/bottom. Default: `true`. */
  loop?: boolean;
  /** Type-ahead prefix-match item highlighting. Default: `true`. */
  typeAhead?: boolean;
  /** Theme-aware inline style. */
  sx?: Sx | undefined;
  /** Inline style; merged after recipe + Floating UI positioning styles. */
  style?: CSSProperties | undefined;
}

/**
 * A single option. `value` is required; the consumer's `children` becomes the rendered label and
 * also the type-ahead `textValue` unless explicitly overridden via the `textValue` prop (useful
 * when children is a complex JSX tree).
 */
export interface SelectItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Unique value identifying this option. Submitted with the form when selected. */
  value: string;
  /** Decorative icon at logical start; rendered before the label. */
  leftIcon?: ReactNode;
  /** Disable interaction + skip keyboard nav. */
  disabled?: boolean;
  /**
   * Override the search-text used for type-ahead. Defaults to `children` when it's a string,
   * else falls back to `aria-label`, else empty (item then only matches by explicit aria-label).
   */
  textValue?: string;
  /** Theme-aware inline style. */
  sx?: Sx | undefined;
}

/**
 * Slot rendered inside the currently-selected item. Defaults to a `<Check>` icon (consumers can
 * pass children to override). Lives in its own subpart so theme overrides can target it.
 */
export interface SelectItemIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  sx?: Sx | undefined;
}

/** Visual + ARIA grouping container. `role="group"`. */
export interface SelectGroupProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/** Non-interactive section header above a group of items. `role="presentation"`. */
export interface SelectLabelProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/** Horizontal rule between sections. `role="separator"`. */
export interface SelectSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/**
 * Static information about a registered item. Sufficient to drive keyboard nav + type-ahead +
 * `aria-activedescendant` wiring.
 */
export interface SelectItemRegistration {
  /** Used for type-ahead matching. */
  textValue: string;
  /** Rendered label for the trigger (when this item is selected). */
  label: ReactNode;
  /** When `true`, the item is skipped during arrow / Home / End traversal. */
  disabled: boolean;
}

export interface SelectItemRecord extends SelectItemRegistration {
  id: string;
  value: string;
  node: HTMLElement;
}

/**
 * Internal context shape consumed by every Select subpart. Exported so the subpart files can
 * type their `useContext` calls without re-declaring the union.
 */
export interface SelectContextValue {
  /** Currently-selected value (empty string for "no selection"). */
  value: string;
  /** Set the value (closes the listbox if a real item was picked). */
  setValue: (next: string) => void;
  /** Listbox open state. */
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Trigger element capture for outside-click / position anchoring. */
  triggerRef: RefCallback<HTMLElement | null>;
  triggerNodeRef: MutableRefObject<HTMLElement | null>;
  /** Floating element capture. */
  floatingNodeRef: MutableRefObject<HTMLElement | null>;
  registerContent: (node: HTMLElement | null) => void;
  /** Item registration callback — items invoke this on mount/unmount with their node + metadata. */
  registerItem: (id: string, node: HTMLElement | null, opts: SelectItemRegistration, value: string) => void;
  /** Returns currently-registered enabled items in DOM order. */
  getEnabledItems: () => SelectItemRecord[];
  /** Returns all currently-registered items (including disabled) in DOM order. */
  getAllItems: () => SelectItemRecord[];
  /**
   * Reads the persistent value→label cache. Used by the Trigger to render the selected item's
   * label across listbox open/close cycles (items unmount on close, but the cache survives).
   */
  getLabelForValue: (value: string) => SelectItemRegistration['label'] | undefined;
  /** Bump counter — context consumers re-render when items appear / disappear / re-label. */
  itemsVersion: number;
  /** Currently-highlighted item id (keyboard nav). `null` when none. */
  highlightedId: string | null;
  /** Sets the highlight (drives `aria-activedescendant`). */
  setHighlightedId: (id: string | null) => void;
  /** Trigger id + listbox id for ARIA pairings. */
  triggerId: string;
  contentId: string;
  /** Visual axes propagated from the root for Trigger to consume. */
  variant: ResponsiveValue<SelectVariant> | undefined;
  size: ResponsiveValue<SelectSize> | undefined;
  color: ResponsiveValue<SelectColor> | undefined;
  fullWidth: ResponsiveValue<boolean> | undefined;
  /** Form-control attributes from `useFormFieldA11y` (merged into the trigger). */
  a11y: {
    id: string;
    'aria-invalid'?: 'true' | undefined;
    'aria-required'?: 'true' | undefined;
    'aria-describedby'?: string | undefined;
    'data-invalid'?: 'true' | undefined;
  };
  /** Placeholder text shown when value is empty. */
  placeholder: string | undefined;
  /** Form name (for the hidden input). */
  name: string | undefined;
  /** Whether the field is disabled. */
  disabled: boolean;
  /** Whether the field is required. */
  required: boolean;
}