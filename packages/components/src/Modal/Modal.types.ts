import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual chrome for the Modal Content surface. Two variants only — Modal is a structural primitive
 * (Header / Body / Footer regions are the interesting axis), not a stylistic one. The DS keeps the
 * variant prop for parity with every other component, but no 4-variant explosion here.
 *
 * - `solid`   — paper background, transparent border, `shadow-2xl`. **Default.**
 * - `outline` — paper background + 1px subtle border, `shadow-xl`. Quieter; better when nested
 *   inside heavy `blur` backdrops where the heavier shadow would muddy the layered look.
 */
export type ModalVariant = 'solid' | 'outline';

/**
 * Modal Content sizes. Drives `max-width` on Content and per-slot padding on Header / Body /
 * Footer. The `full` size collapses the rounded corners and removes the viewport gutter so it
 * acts as a fullscreen overlay; `fit` wraps to the content's intrinsic width (rare).
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fit';

/**
 * Vertical placement of Content inside the backdrop. `center` is the conventional dialog look;
 * `top` anchors near the top of the viewport for tall content (Slack-style "Create" dialogs).
 */
export type ModalPlacement = 'center' | 'top';

/**
 * The backdrop's visual treatment. `dimmed` is the conventional semi-transparent overlay; `blur`
 * adds a glass effect; `transparent` hides the backdrop entirely (still captures clicks for
 * `closeOnBackdropClick` purposes).
 */
export type ModalOverlay = 'dimmed' | 'blur' | 'transparent';

/** `Modal.Footer` button-row alignment. Mirrors `<Card.Footer>`'s align grammar. */
export type ModalFooterAlign = 'start' | 'center' | 'end' | 'between';

/**
 * Root `<Modal>` props. Owns all the state + lifecycle toggles. Visual axes (`variant` / `size`
 * / `placement` / `overlay`) live on `<Modal.Content>` since that's where they're rendered.
 */
export interface ModalProps {
  /** Controlled `open`. When omitted, Modal manages its own state via `defaultOpen`. */
  open?: boolean;
  /** Initial `open` for the uncontrolled case. Default: `false`. */
  defaultOpen?: boolean;
  /** Notified whenever `open` changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Default: `true`. Esc closes the topmost Modal (escape-stack ordering). */
  closeOnEscape?: boolean;
  /**
   * Default: `true`. Clicking the backdrop closes the Modal. Set to `false` for destructive-
   * confirm modals where an accidental backdrop click should not lose work.
   */
  closeOnBackdropClick?: boolean;
  /** Default: `true`. Focus is trapped inside Content while open and restored on close. */
  trapFocus?: boolean;
  /**
   * Default: `true`. Locks `document.body` scroll while open via the engine's reference-counted
   * `useScrollLock` (so a Modal-over-Drawer combo collapses into one lock + unlock pair).
   */
  preventScroll?: boolean;
  /**
   * Element to focus when Content mounts. Defaults to the first focusable descendant; if there
   * are none, Content itself (carries `tabIndex={-1}`) is focused.
   */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /**
   * Element to focus when Content unmounts. Defaults to the trigger that opened the Modal (if
   * there was one); falls back to whatever was focused at open-time.
   */
  finalFocus?: RefObject<HTMLElement | null> | undefined;
  children: ReactNode;
}

export interface ModalTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * When `true` (default), clone the single child and attach the open-trigger props. When
   * `false`, render an inline `<button type="button">` wrapping the children.
   */
  asChild?: boolean;
  children: ReactNode;
}

export interface ModalContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual chrome. Default: `'solid'`. */
  variant?: ResponsiveValue<ModalVariant>;
  /** Size scale (max-width + per-slot padding). Default: `'md'`. */
  size?: ResponsiveValue<ModalSize>;
  /** Vertical placement. Default: `'center'`. */
  placement?: ResponsiveValue<ModalPlacement>;
  /** Backdrop treatment. Default: `'dimmed'`. */
  overlay?: ResponsiveValue<ModalOverlay>;
  /** Override the portal target. `null` falls back to `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** Theme-aware inline style object. Merged after the recipe's `style`. */
  sx?: Sx | undefined;
  /** Inline style. Merged after recipe + sx. */
  style?: CSSProperties | undefined;
}

export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Title text (or rich content). Rendered inside an element marked with the `aria-labelledby`
   * id from the parent Modal context, so ARIA association is automatic. When omitted, the
   * Header is purely structural.
   */
  title?: ReactNode;
  /**
   * Description text. Rendered inside an element marked with the `aria-describedby` id from the
   * parent Modal context — same automatic ARIA wiring as `title`.
   */
  description?: ReactNode;
  /** Optional avatar / icon at the start of the header (e.g. a status icon). */
  avatar?: ReactNode;
  /** Optional action element at the end of the header (e.g. a settings menu trigger). */
  action?: ReactNode;
  sx?: Sx | undefined;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Footer button-row alignment. Default: `'end'`. */
  align?: ResponsiveValue<ModalFooterAlign>;
  sx?: Sx | undefined;
}

export interface ModalCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
export interface ModalContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: (node: HTMLElement | null) => void;
  triggerNodeRef: RefObject<HTMLElement | null>;
  contentNodeRef: RefObject<HTMLElement | null>;
  registerContent: (node: HTMLElement | null) => void;
  triggerId: string;
  titleId: string;
  descId: string;
  size: ModalSize;
  variant: ModalVariant;
  trapFocus: boolean;
  closeOnBackdropClick: boolean;
  initialFocus: RefObject<HTMLElement | null> | undefined;
  finalFocus: RefObject<HTMLElement | null> | undefined;
}
