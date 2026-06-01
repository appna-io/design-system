import type {
  CSSProperties,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { PopoverPlacement } from '../Popover/Popover.types';

/**
 * Visual chrome for the floating menu surface — same three variants as Popover (`solid`,
 * `outline`, `soft`) so a Menu visually reads as "an interactive Popover with a list inside".
 * No `inverted` variant; menus carry focusable items and the inverted color contract conflicts
 * with focusable indicator styling.
 */
export type MenuVariant = 'solid' | 'outline' | 'soft';

export type MenuSize = 'sm' | 'md' | 'lg';

export type MenuColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Reuse Popover's placement vocabulary — every overlay primitive in the DS uses a single
 * placement enum (matching Floating UI). Aliasing keeps the surface single-sourced so a future
 * placement (e.g. diagonal) flows through every overlay without per-component edits.
 */
export type MenuPlacement = PopoverPlacement;

/**
 * How the trigger opens the menu. One axis collapses Radix's `<DropdownMenu>` + `<ContextMenu>`
 * + `<HoverMenu>` into a single component.
 *
 * - `'click'`   — default. Dropdown menu pattern. Click trigger toggles open.
 * - `'context'` — right-click anywhere inside the trigger area opens at the cursor position
 *   (virtual element anchoring). Default `contextmenu` is suppressed.
 * - `'hover'`   — pointer-enter opens after a short delay; pointer-leave closes after a longer
 *   delay (Apple-style). Rare in practice — use sparingly; keyboard / a11y still works via Enter.
 */
export type MenuTriggerKind = 'click' | 'context' | 'hover';

/**
 * Item color axis. Constrained to `neutral` and `danger` on purpose:
 *
 * - Most menu items are neutral; coloring every item turns the menu into a rainbow.
 * - "Destructive" item (`Delete`, `Remove`, `Sign out`) is the one canonical exception and
 *   deserves a first-class slot for muscle-memory consistency.
 *
 * Consumers needing a different per-item color can pass `className` — but that's a one-off
 * affordance, not a design contract.
 */
export type MenuItemColor = 'neutral' | 'danger';

/**
 * The root `<Menu>` props. Owns the open state, all the close-behavior toggles, and the
 * `trigger` variable. The visual axes (`variant` / `size` / `color` / `placement` / `offset`)
 * live on `<Menu.Content>`, mirroring Popover's split.
 */
export interface MenuProps {
  /** Controlled `open`. When omitted, the menu manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /** Notified whenever `open` flips (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** How the trigger opens the menu. Default: `'click'`. */
  trigger?: MenuTriggerKind;
  /** Default: `true`. Esc closes the topmost open menu / submenu (escape-stack ordering). */
  closeOnEscape?: boolean;
  /** Default: `true`. Pointerdown outside trigger + content closes the menu. */
  closeOnOutsideClick?: boolean;
  /**
   * Default: `true`. Closes after a `<Menu.Item>`'s `onSelect` fires. Set `false` to keep the
   * menu open after a click (useful for "Save and stay" flows). `<Menu.CheckboxItem>` and
   * `<Menu.RadioItem>` override this to `false` internally — toggling a checkbox usually
   * shouldn't close the menu mid-decision.
   */
  closeOnSelect?: boolean;
  /** Hover-open delay in ms when `trigger="hover"`. Default: `120`. */
  openDelay?: number;
  /** Hover-close delay in ms when `trigger="hover"`. Default: `180`. */
  closeDelay?: number;
  children: ReactNode;
}

/**
 * The trigger. Same `asChild` semantics as Popover — clone a single child element and attach
 * ref + ARIA + event handlers to it, or render an inline `<button>` if `asChild={false}`.
 *
 * The trigger's wiring varies by `trigger` mode (resolved by the root):
 * - `click`   → `onClick` toggles open.
 * - `context` → `onContextMenu` opens at cursor (preventDefault); `onClick` is a no-op.
 * - `hover`   → `onPointerEnter` + `onPointerLeave` drive open/close with delays.
 *
 * The `data-state="open|closed"` attribute is always set so consumers can style the open state
 * (e.g. a chevron rotation) without a context read.
 */
export interface MenuTriggerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  asChild?: boolean;
  children: ReactNode;
}

/**
 * The floating surface. Visual axes + placement live here so consumers can target Content's
 * theme slot independently. Compound `<Menu.Item>`-and-friends children read keyboard + selection
 * state from `MenuContext`.
 */
export interface MenuContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual chrome. Default: `'solid'`. */
  variant?: ResponsiveValue<MenuVariant>;
  /** Size axis — drives item padding + content padding + font. Default: `'md'`. */
  size?: ResponsiveValue<MenuSize>;
  /** Palette role — accents border + tint on `outline` / `soft`. Default: `'neutral'`. */
  color?: ResponsiveValue<MenuColor>;
  /** Preferred placement; Floating UI's `flip` may swap. Default: `'bottom-start'`. */
  placement?: ResponsiveValue<MenuPlacement>;
  /** Px gap between trigger and surface. Default: `4`. */
  offset?: number;
  /** Override the portal target. `null` → `document.body`. */
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
 * A single action row. `onSelect` fires for keyboard Enter/Space + mouse click. The default
 * `closeOnSelect={true}` from the root makes the menu close after; pass it `false` at the root
 * to keep it open.
 */
export interface MenuItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onSelect'> {
  /** Decorative icon at logical start. Always `aria-hidden`; the item's text label is the name. */
  leftIcon?: ReactNode;
  /** Decorative icon at logical end (after the label, before `shortcut`). */
  rightIcon?: ReactNode;
  /** Visual hint for a keyboard shortcut. Not a binding — consumers wire the binding themselves. */
  shortcut?: string;
  /** Disable interaction + desaturate. */
  disabled?: boolean;
  /** Item color tone — only `neutral` (default) or `danger` for destructive items. */
  color?: MenuItemColor;
  /** Fires for keyboard Enter/Space + mouse click. */
  onSelect?: () => void;
  /** Theme-aware inline style. */
  sx?: Sx | undefined;
}

/** Non-interactive section header rendered above a group of items. */
export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/**
 * Visual + ARIA grouping container. Renders `role="group"` so screen readers announce the items
 * inside as a related set; pair with a leading `<Menu.Label>` for the section name (the label is
 * automatically associated via `aria-labelledby`).
 */
export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/** Horizontal rule separating menu sections. `role="separator"`, decorative. */
export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

/**
 * Multi-select item. Carries `role="menuitemcheckbox"` + `aria-checked`. `closeOnSelect=false`
 * is forced internally — toggling a checkbox shouldn't close the menu mid-decision.
 */
export interface MenuCheckboxItemProps
  extends Omit<MenuItemProps, 'onSelect'> {
  /** Controlled checked state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Uncontrolled initial state. Default: `false`. */
  defaultChecked?: boolean;
  /** Fires on every toggle. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Container for a set of `<Menu.RadioItem>`s. Owns the single-pick state machine via the same
 * `useControllableState` shape Toggle / Switch use. Group emits `role="group"`.
 */
export interface MenuRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires when the active item changes. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

/**
 * One radio in a `<Menu.RadioGroup>`. Carries `role="menuitemradio"` + `aria-checked`. Must be
 * rendered inside a `<Menu.RadioGroup>` ancestor — runtime throws otherwise.
 */
export interface MenuRadioItemProps extends Omit<MenuItemProps, 'onSelect'> {
  /** Unique value identifying this item in the parent's `value`. */
  value: string;
}

/** Container for a submenu — owns its own open state via nested `MenuContext`. */
export interface MenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover-open delay in ms. Default: `120`. */
  openDelay?: number;
  /** Hover-close delay in ms. Default: `220`. */
  closeDelay?: number;
  children: ReactNode;
}

/** Submenu trigger. Renders as a menu item with a logical-end chevron. */
export interface MenuSubTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  leftIcon?: ReactNode;
  disabled?: boolean;
  sx?: Sx | undefined;
}

/** Submenu floating surface. Same axes as `<Menu.Content>`. */
export interface MenuSubContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: ResponsiveValue<MenuVariant>;
  size?: ResponsiveValue<MenuSize>;
  color?: ResponsiveValue<MenuColor>;
  /** Defaults to `'right-start'` (LTR) — Floating UI flips to `'left-start'` in RTL automatically. */
  placement?: ResponsiveValue<MenuPlacement>;
  offset?: number;
  portalContainer?: HTMLElement | null | undefined;
  loop?: boolean;
  typeAhead?: boolean;
  sx?: Sx | undefined;
  style?: CSSProperties | undefined;
}

/**
 * Virtual element shape consumed by `usePosition` for the context-menu mode. Floating UI
 * accepts an object with `getBoundingClientRect()` instead of an actual DOM node — we synthesize
 * a 1px rectangle at the click coordinates.
 */
export interface MenuVirtualAnchor {
  getBoundingClientRect: () => {
    x: number;
    y: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
}

/**
 * Internal root context. Carries every signal an item needs to render and behave correctly:
 *
 * - open state + setters (so an Item's onSelect can close)
 * - registration callbacks for the keyboard registry (DOM-order traversal + type-ahead)
 * - highlight signal (which value is currently keyboard-highlighted)
 * - `closeOnSelect` so individual items can opt out (Checkbox/Radio do)
 *
 * Exported so the subpart files can type their `useContext` consumers without re-declaring.
 */
export interface MenuContextValue {
  /** Whether the menu is currently open. */
  open: boolean;
  /** Setter — drives controlled and uncontrolled paths via `useControllableState`. */
  setOpen: (next: boolean) => void;
  /** Trigger element capture (callback ref for live-node access in outside-click checks). */
  triggerRef: RefCallback<HTMLElement | null>;
  triggerNodeRef: MutableRefObject<HTMLElement | null>;
  /** Floating element capture. */
  floatingNodeRef: MutableRefObject<HTMLElement | null>;
  registerContent: (node: HTMLElement | null) => void;
  /** Item-element registry used by the keyboard hook + outside-click + focus mgmt. */
  registerItem: (id: string, node: HTMLElement | null, opts: MenuItemRegistration) => void;
  /** Returns currently-mounted, non-disabled items in DOM order. */
  getEnabledItems: () => MenuItemRecord[];
  /** Currently-highlighted item id; `null` when none. */
  highlightedId: string | null;
  /** Sets the highlight target. */
  setHighlightedId: (id: string | null) => void;
  /** ARIA pairings between trigger and content. */
  contentId: string;
  triggerId: string;
  /** Trigger mode resolved at the root. */
  triggerKind: MenuTriggerKind;
  /** Root-level close-on-select default. CheckboxItem / RadioItem override at the call site. */
  closeOnSelect: boolean;
  /** Virtual anchor for `trigger="context"` (cursor-relative positioning). */
  contextAnchor: MenuVirtualAnchor | null;
  /** Set the virtual anchor (called by the context-mode Trigger on contextmenu). */
  setContextAnchor: (anchor: MenuVirtualAnchor | null) => void;
  /** Hover-mode delays, resolved at the root. */
  openDelay: number;
  closeDelay: number;
}

/** Static information about a registered item — sufficient to drive keyboard nav + type-ahead. */
export interface MenuItemRegistration {
  /** Text content used for type-ahead matching. */
  textValue: string;
  /** When `true`, the item is skipped during arrow / Home / End traversal. */
  disabled: boolean;
}

export interface MenuItemRecord extends MenuItemRegistration {
  id: string;
  node: HTMLElement;
}

/** Submenu context — exposes the submenu's open state to its `SubTrigger` and `SubContent`. */
export interface MenuSubContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerNodeRef: MutableRefObject<HTMLElement | null>;
  floatingNodeRef: MutableRefObject<HTMLElement | null>;
  registerContent: (node: HTMLElement | null) => void;
  contentId: string;
  triggerId: string;
  openDelay: number;
  closeDelay: number;
  /** Schedules the open after `openDelay` (cancellable). */
  scheduleOpen: () => void;
  /** Schedules the close after `closeDelay` (cancellable). */
  scheduleClose: () => void;
  /** Cancels any pending open/close timer. Called by hover-into the SubContent. */
  cancelPending: () => void;
}

/**
 * Radio-group context shape consumed by `<Menu.RadioItem>` — exposes the current selected value
 * and a setter that respects controlled / uncontrolled state.
 */
export interface MenuRadioGroupContextValue {
  value: string | undefined;
  setValue: (next: string) => void;
}

/**
 * Options for `useMenuKeyboard`. Receives the registry accessor from `MenuContext` and translates
 * arrow / Home / End / Enter / Space / Esc / Tab / type-ahead into highlight + selection actions.
 */
export interface UseMenuKeyboardOptions {
  /** Returns items in DOM order; the hook re-queries on each key press so dynamic items work. */
  getItems: () => MenuItemRecord[];
  /** Reads the currently highlighted id. */
  getHighlightedId: () => string | null;
  /** Updates the highlighted id (or clears it). */
  setHighlightedId: (id: string | null) => void;
  /** Whether arrow-key navigation wraps. */
  loop: boolean;
  /** Whether type-ahead prefix matching is active. */
  typeAhead: boolean;
  /** Called for Esc + Tab. */
  onClose: () => void;
  /** Called for Enter / Space on the highlighted item. Returns false to indicate "no item". */
  onSelect: (id: string) => void;
  /** Called for Right arrow when the highlighted item is a submenu trigger. */
  onOpenSub?: (id: string) => void;
  /** Called for Left arrow inside a submenu (close it). */
  onCloseSub?: () => void;
}

/** Returns the keyboard handler the consumer attaches to `<Menu.Content>`'s `onKeyDown`. */
export type MenuKeyHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

/** A floating ref object that may be `null` until mount. */
export type NullableRef<T> = RefObject<T | null>;