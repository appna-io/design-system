'use client';

import {
  useControllableState,
  useEscapeStack,
  useScrollLock,
} from '@apx-ui/engine';
import { useCallback, useId, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';

import { ModalContext } from './ModalContext';
import type { ModalContextValue, ModalProps, ModalSize, ModalVariant } from './Modal.types';

/**
 * The compound root. `<Modal>` owns:
 *
 *  - **State** — controlled / uncontrolled `open` via the engine's `useControllableState`.
 *  - **Lifecycle** — `useEscapeStack` (Esc → close, with nested-overlay ordering) and
 *    `useScrollLock` (engine-wide, reference-counted body-scroll lock — first consumer is here,
 *    closing the Phase 17 Core consumer audit).
 *  - **IDs** — `triggerId` / `titleId` / `descId` so Header's title + description elements wire
 *    into Content's `aria-labelledby` / `aria-describedby` automatically.
 *  - **Refs** — trigger and content node refs for return-focus and `e.target === e.currentTarget`
 *    backdrop-sentinel checks inside `<Modal.Content>`.
 *
 * Visual axes (`variant` / `size` / `placement` / `overlay`) live on `<Modal.Content>`. Children
 * read from `ModalContext` so the entire compound stays declarative — no prop threading.
 *
 * @example
 *   <Modal>
 *     <Modal.Trigger><Button>Open</Button></Modal.Trigger>
 *     <Modal.Content size="md">
 *       <Modal.Header title="Settings" description="Update your details." />
 *       <Modal.Body>…</Modal.Body>
 *       <Modal.Footer><Modal.Close /><Button>Save</Button></Modal.Footer>
 *     </Modal.Content>
 *   </Modal>
 */
export function Modal(props: ModalProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    trapFocus = true,
    preventScroll = true,
    initialFocus,
    finalFocus,
    children,
  } = props;

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Ids paired across Trigger ↔ Content (labelledby) and Header (title/desc) ↔ Content
  // (labelledby/describedby). `useId` is SSR-safe.
  const triggerId = useId();
  const titleId = useId();
  const descId = useId();

  // Trigger node ref captured via callback — needed for return-focus on close. Wired into the
  // trigger via `<Modal.Trigger>`'s ref-merge.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const triggerRef = useCallback((node: HTMLElement | null) => {
    triggerNodeRef.current = node;
  }, []);

  // Content node ref — used by `<Modal.Content>` for focus-trap container + (separately) by the
  // backdrop click sentinel. Stored here so the entire compound shares one source of truth.
  const contentNodeRef = useRef<HTMLElement | null>(null);
  const registerContent = useCallback((node: HTMLElement | null) => {
    contentNodeRef.current = node;
  }, []);

  // Esc handling. The escape-stack ensures only the topmost Modal closes per press, so a Modal
  // nested inside another Modal unwinds one layer at a time.
  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape });

  // **First consumer of `useScrollLock`**. Engine reference-counts so a Drawer-over-Modal combo
  // collapses to a single lock + unlock pair without per-component coordination.
  useScrollLock(open && preventScroll);

  // Default size / variant for context — Header / Footer / Body read this so their per-slot
  // padding follows Content's `size` axis. The ResponsiveValue is resolved inside Content via
  // `useThemedClasses`; the context-level value is the primitive default for child slots.
  // Subparts that want responsive size react to Content's resolved class string instead.
  const defaultSize: ModalSize = 'md';
  const defaultVariant: ModalVariant = 'solid';

  const ctxValue = useMemo<ModalContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerNodeRef,
      contentNodeRef,
      registerContent,
      triggerId,
      titleId,
      descId,
      size: defaultSize,
      variant: defaultVariant,
      trapFocus,
      closeOnBackdropClick,
      initialFocus,
      finalFocus,
    }),
    [
      open,
      setOpen,
      triggerRef,
      registerContent,
      triggerId,
      titleId,
      descId,
      trapFocus,
      closeOnBackdropClick,
      initialFocus,
      finalFocus,
    ],
  );

  return <ModalContext.Provider value={ctxValue}>{children}</ModalContext.Provider>;
}

Modal.displayName = 'Modal';