'use client';

import { mergeRefs, Portal, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { useListKeyboard } from '../_shared/useListKeyboard';

import { selectMotion } from './Select.motion';
import { selectContentRecipe } from './Select.recipe';
import { useSelectContext } from './SelectContext';
import type { SelectContentProps, SelectPlacement } from './Select.types';

/**
 * The portal-rendered listbox. Mirrors `MenuContent`'s engine consumption (Portal + usePosition +
 * AnimatePresence + shared keyboard hook) with three Select-specific differences:
 *
 *  1. **`matchTriggerWidth: true`** by default — Floating UI's `size` middleware syncs the
 *     listbox width to the trigger. This is the form-control expectation; consumers can opt out
 *     for cases like a country picker with very long names.
 *  2. **`role="listbox"` + `aria-activedescendant`** — combobox-pattern ARIA (Menu uses
 *     `role="menu"` with the highlighted item carrying `aria-current` implicitly via
 *     `data-highlighted`; Select must surface the active descendant id explicitly because the
 *     focus stays on Content while items get logically "focused" via the descendant attr).
 *  3. **No SubContent equivalent** — Select has no nesting in V1, so the keyboard hook is
 *     instantiated without `onOpenSub` / `onCloseSub` callbacks.
 *
 * The keyboard `onSelect(id)` dispatches a synthetic `node.click()` on the item, which the
 * Item's own `onClick` captures. That keeps the mouse + keyboard code paths identical — same
 * pattern Menu uses.
 *
 * Focus discipline: Content carries `tabIndex={-1}` and grabs focus on mount via a deferred
 * effect (so the portalled node is in the DOM first). On close we restore focus to the trigger
 * provided focus was still inside Content — same heuristic Menu uses to avoid stealing focus
 * from elsewhere.
 */
function SelectContentImpl(
  props: SelectContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    placement: placementProp,
    offset = 4,
    matchTriggerWidth = true,
    portalContainer,
    loop = true,
    typeAhead = true,
    className,
    style,
    sx,
    children,
    onKeyDown,
    ...rest
  } = props;

  const ctx = useSelectContext('Select.Content');
  const {
    open,
    setOpen,
    setValue,
    contentId,
    triggerId,
    triggerNodeRef,
    registerContent,
    getEnabledItems,
    getAllItems,
    setHighlightedId,
    highlightedId,
    size,
    color,
  } = ctx;

  // Resolve responsive `placement` to a primitive for `usePosition` (which only takes one value).
  const placement: SelectPlacement =
    typeof placementProp === 'string' ? (placementProp as SelectPlacement) : 'bottom-start';

  const { triggerRef, floatingRef, placement: actualPlacement, floatingStyles } = usePosition({
    placement,
    offset,
    matchTriggerWidth,
    open,
  });

  // Wire the trigger DOM node into Floating UI whenever it (re-)mounts. Same pattern as
  // MenuContent — the trigger ref is captured on the root and stays stable, so we hand it to
  // Floating UI here.
  useEffect(() => {
    const node = triggerNodeRef.current;
    if (node) (triggerRef as unknown as (el: unknown) => void)(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Local ref for focus management — we focus Content on open and restore focus to the trigger
  // on close (same heuristic Menu uses).
  const localFloatingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      localFloatingRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    const floating = localFloatingRef.current;
    if (floating && active && (active === floating || floating.contains(active))) {
      triggerNodeRef.current?.focus({ preventScroll: true });
    } else if (!active || active === document.body) {
      triggerNodeRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll the highlighted item into view. Native `<select>` does this; without it,
  // keyboard nav past the visible window feels broken. Guarded with a function check because
  // jsdom (and SSR) don't ship the API — same conservative call shape we use for matchMedia.
  useEffect(() => {
    if (!open || !highlightedId) return;
    const all = getAllItems();
    const target = all.find((it) => it.id === highlightedId);
    if (target?.node && typeof target.node.scrollIntoView === 'function') {
      target.node.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedId, getAllItems]);

  const onClose = useCallback(() => setOpen(false), [setOpen]);

  const onSelect = useCallback(
    (id: string) => {
      const items = getEnabledItems();
      const target = items.find((it) => it.id === id);
      if (!target) return;
      // Dispatch a real DOM click — the item's onClick captures it and calls ctx.setValue with
      // its own value. Keeps mouse + keyboard going through the same code path.
      target.node.click();
    },
    [getEnabledItems],
  );

  // Reuse the same keyboard hook Menu uses — Select is the second consumer (the abstraction
  // was promoted from Menu/useMenuKeyboard.ts to _shared/useListKeyboard.ts for this phase).
  const handleKeyDown = useListKeyboard({
    getItems: getEnabledItems,
    getHighlightedId: () => highlightedId,
    setHighlightedId,
    loop,
    typeAhead,
    onClose,
    onSelect,
  });

  const composedKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      handleKeyDown(event);
    },
    [onKeyDown, handleKeyDown],
  );

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: selectContentRecipe,
    componentName: 'Select',
    slot: 'content',
    props: {
      variant,
      size,
      color,
      className,
      sx,
      style,
    },
  });

  const composedFloatingRef = mergeRefs<HTMLDivElement>(
    floatingRef as unknown as Ref<HTMLDivElement>,
    localFloatingRef as unknown as Ref<HTMLDivElement>,
    (node: HTMLDivElement | null) => registerContent(node as HTMLElement | null),
    forwardedRef as Ref<HTMLDivElement>,
  );

  const surfaceStyle: CSSProperties = {
    ...(floatingStyles as CSSProperties),
    ...(contentStyle ?? {}),
  };

  // We rely on the keyboard onSelect path to commit values — setValue is exposed via context for
  // items to call directly from onClick. Mark it referenced so the destructure rule is happy.
  void setValue;

  const motionExtraProps: Record<string, unknown> = { ...rest };

  // We deliberately keep the content node mounted across open/close cycles. Two reasons:
  //
  //  1. **Eager label discovery.** `<Select.Item>` registers its `value → label` mapping with
  //     the root on mount. If we toggled the children's mount via AnimatePresence, the very
  //     first render of a controlled `<Select defaultValue="fr">` (with the listbox still
  //     closed) would have no items in the cache and the Trigger would display the raw `"fr"`
  //     instead of "France". Keeping items mounted means the cache is populated before the
  //     user ever opens the listbox.
  //  2. **Cheap toggle.** Re-portaling and re-running every item's mount effect on every open
  //     is wasteful; flipping visibility + pointer-events on a single wrapper is free.
  //
  // Hiding discipline when closed:
  //   - `visibility: hidden` instead of `display: none` so layout measurements (used by
  //     Floating UI / item refs) are accurate before the open animation runs.
  //   - `pointer-events: none` so the invisible panel can't capture clicks / hovers.
  //   - `aria-hidden="true"` + `inert` (where supported) so screen readers + tab order skip it.
  //   - Position is fully off-screen via `floatingStyles` (Floating UI returns a real position
  //     anyway once the trigger is mounted), so the hidden node doesn't enlarge the document.
  //
  // Motion: we drive `animate` between two named states; framer-motion handles the transition
  // and respects `prefers-reduced-motion` (collapsing to opacity-only) the same way Popover /
  // Menu do.
  const motionPreset = selectMotion(actualPlacement as SelectPlacement);
  const hiddenStyle: CSSProperties = open
    ? {}
    : {
        visibility: 'hidden',
        pointerEvents: 'none',
      };

  return (
    <Portal container={portalContainer}>
      <motion.div
        ref={composedFloatingRef}
        id={contentId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={triggerId}
        aria-activedescendant={open ? highlightedId ?? undefined : undefined}
        aria-hidden={open ? undefined : true}
        data-state={open ? 'open' : 'closed'}
        data-placement={actualPlacement}
        data-variant={typeof variant === 'string' ? variant : 'solid'}
        className={contentClass}
        style={{ ...(surfaceStyle as object), ...hiddenStyle } as never}
        onKeyDown={composedKeyDown}
        initial={motionPreset.initial}
        animate={open ? motionPreset.animate : motionPreset.initial}
        transition={motionPreset.transition}
        {...motionExtraProps}
      >
        {children}
      </motion.div>
    </Portal>
  );
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(SelectContentImpl);
SelectContent.displayName = 'Select.Content';