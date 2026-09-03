import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * A fixed physical edge. Means the same thing in every direction: `left` is the left of the
 * viewport whether the document reads LTR or RTL. Border placement inside the recipe still uses
 * logical axes (`border-s` / `border-e`) so the inner edge lands correctly either way.
 */
export type DrawerPhysicalSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * A direction-relative edge. `start` is the inline-start edge (left in LTR, right in RTL) and
 * `end` its opposite — the same grammar as CSS logical properties and as `border-s` / `border-e`
 * in the recipes. There is no logical vertical pair: the block axis does not flip with `dir`, so
 * `top` / `bottom` are already direction-correct as physical values.
 */
export type DrawerLogicalSide = 'start' | 'end';

/**
 * Edge the Drawer slides in from.
 *
 * Prefer the logical values: a cart pinned to `end` opens on the same side as the basket button
 * that triggered it in both directions, which is almost always what a consumer means. Reach for a
 * physical value only when you genuinely mean a fixed edge that must not flip with `dir`.
 *
 * `DrawerContent` resolves the logical values against the ambient direction before anything else
 * sees them, so the recipes, the slide motion, and `data-side` all stay physical.
 */
export type DrawerSide = DrawerPhysicalSide | DrawerLogicalSide;

/**
 * Drawer Content size. The axis the size controls depends on `side`:
 *  - For `left` / `right`  → `max-width` (the drawer's width).
 *  - For `top` / `bottom`  → `max-height` (the drawer's height).
 *
 * `full` means full width on horizontal drawers, full height on vertical (a fullscreen takeover
 * minus the opposite-edge gutter).
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Backdrop treatment. Same vocabulary as Modal so consumers don't have to relearn it.
 *
 * - `dimmed` (default) — semi-transparent overlay. Always safe.
 * - `blur` — glass effect. Use sparingly.
 * - `transparent` — no tint, but still captures clicks for `closeOnBackdropClick`.
 */
export type DrawerOverlay = 'dimmed' | 'blur' | 'transparent';

/** `Drawer.Footer` button-row alignment. Same grammar as Modal / Card. */
export type DrawerFooterAlign = 'start' | 'center' | 'end' | 'between';

/**
 * Root `<Drawer>` props. State + lifecycle live here; visual axes live on `<Drawer.Content>`.
 * Mirrors `<Modal>` 1:1 — Drawer is structurally Modal-with-an-edge.
 */
export interface DrawerProps {
  /** Controlled `open`. When omitted, Drawer manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /** Notified whenever `open` changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Default: `true`. Esc closes the topmost Drawer (escape-stack ordering). */
  closeOnEscape?: boolean;
  /**
   * Default: `true`. Click on the backdrop closes the Drawer. Set to `false` for destructive-
   * action drawers where an accidental click should not lose work.
   */
  closeOnBackdropClick?: boolean;
  /** Default: `true`. Focus is trapped inside Content while open and restored on close. */
  trapFocus?: boolean;
  /**
   * Default: `true`. Locks `document.body` scroll while open via the engine's reference-counted
   * `useScrollLock` (so a Drawer-over-Modal combo collapses into one lock + unlock pair).
   */
  preventScroll?: boolean;
  /**
   * Element to focus when Content mounts. Defaults to the first focusable descendant; if there
   * are none, Content itself (carries `tabIndex={-1}`) is focused.
   */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /**
   * Element to focus when Content unmounts. Defaults to the trigger that opened the Drawer (if
   * there was one); falls back to whatever was focused at open-time.
   */
  finalFocus?: RefObject<HTMLElement | null> | undefined;
  children: ReactNode;
}

export interface DrawerTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * When `true` (default), clone the single child and attach the open-trigger props. When
   * `false`, render an inline `<button type="button">` wrapping the children.
   */
  asChild?: boolean;
  children: ReactNode;
}

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /**
   * Edge to anchor / slide from. Accepts the logical `start` / `end` (resolved against the
   * ambient direction) or a fixed physical edge. Default: `'left'`.
   */
  side?: ResponsiveValue<DrawerSide>;
  /** Size scale (max-width on horizontal drawers, max-height on vertical). Default: `'md'`. */
  size?: ResponsiveValue<DrawerSize>;
  /** Backdrop treatment. Default: `'dimmed'`. */
  overlay?: ResponsiveValue<DrawerOverlay>;
  /** Override the portal target. `null` falls back to `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** Theme-aware inline style object. Merged after the recipe's `style`. */
  sx?: Sx | undefined;
  /** Inline style. Merged after recipe + sx. */
  style?: CSSProperties | undefined;
}

export interface DrawerHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Title text (or rich content). Rendered inside an element marked with the `aria-labelledby`
   * id from the parent Drawer context, so ARIA association is automatic.
   */
  title?: ReactNode;
  /**
   * Description text. Rendered inside an element marked with the `aria-describedby` id from the
   * parent Drawer context.
   */
  description?: ReactNode;
  /** Optional avatar / icon at the start of the header. */
  avatar?: ReactNode;
  /** Optional action element at the end of the header (e.g. a settings menu trigger). */
  action?: ReactNode;
  sx?: Sx | undefined;
}

export interface DrawerBodyProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Footer button-row alignment. Default: `'end'`. */
  align?: ResponsiveValue<DrawerFooterAlign>;
  sx?: Sx | undefined;
}

export interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * When `true`, clone the single child and attach the close-trigger props. When `false`
   * (default), render an inline `<button type="button">` carrying an icon `<X>` plus
   * `aria-label="Close"`.
   */
  asChild?: boolean;
  children?: ReactNode;
  sx?: Sx | undefined;
}

/** Internal context shape — exported so subpart files can type their `useContext` consumers. */
export interface DrawerContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: (node: HTMLElement | null) => void;
  triggerNodeRef: RefObject<HTMLElement | null>;
  contentNodeRef: RefObject<HTMLElement | null>;
  registerContent: (node: HTMLElement | null) => void;
  triggerId: string;
  titleId: string;
  descId: string;
  size: DrawerSize;
  trapFocus: boolean;
  closeOnBackdropClick: boolean;
  initialFocus: RefObject<HTMLElement | null> | undefined;
  finalFocus: RefObject<HTMLElement | null> | undefined;
}