'use client';

import {
  Portal,
  forwardRef,
  mergeRefs,
  useEscapeStack,
  useIsomorphicLayoutEffect,
  useOutsideClick,
  usePosition,
  type Placement,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import {
  NavigationMenuContentItemContext,
  useNavigationMenuContext,
  useNavigationMenuItemContext,
  type NavigationMenuContentScope,
} from './NavigationMenu.context';
import { navMenuContentRecipe, navMenuMegaRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuContentProps } from './NavigationMenu.types';

/**
 * `<NavigationMenu.Content>` — the portalled dropdown panel.
 *
 * The panel:
 *   - Renders only when its parent Item's id matches the root's `openItemId`.
 *   - Uses the engine's `usePosition` (Floating UI) to anchor against the
 *     Trigger element captured in the Item's context. The Trigger DOM node is
 *     forwarded via the Item's `setItemNode` ref → captured here via a
 *     `MutationObserver` that re-resolves the trigger if it remounts.
 *   - Lives inside a `<Portal>` so the panel can escape any `overflow: hidden`
 *     ancestor (typical for AppShell headers with sticky-positioned chrome).
 *   - Wires `useEscapeStack` (Esc closes), `useOutsideClick` (click outside
 *     closes), and pointer-enter/leave handlers so the hover bridge works
 *     (sweeping from trigger → content cancels the close timer).
 *   - Emits the `data-state="open" | "closed"` attribute the recipe and the
 *     consumer's CSS hooks read.
 */
export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent(props, forwardedRef): ReactElement | null {
    const { children, variant = 'default', columns = 2, className, style, ...rest } = props;

    const ctx = useNavigationMenuContext('NavigationMenu.Content');
    const itemCtx = useNavigationMenuItemContext('NavigationMenu.Content');

    const isOpen = ctx.openItemId === itemCtx.itemId;

    // Resolve the trigger element from the document. The Item's `setItemNode`
    // hands us the trigger ref via the Item context, but we also want to live-
    // detect remounts; a MutationObserver on the panel's parent <li> keeps the
    // anchor element in sync with whichever trigger is currently mounted.
    const triggerRefHolder = useRef<HTMLElement | null>(null);
    const setTriggerRef = useCallback((node: HTMLElement | null) => {
      triggerRefHolder.current = node;
    }, []);

    // Look up the trigger node by querying inside the menubar root for the
    // trigger marked with `data-nav-item-id={itemId}` and `data-nav-trigger`.
    // Cheap, robust, no extra refs to thread through the tree.
    useIsomorphicLayoutEffect(() => {
      const root = ctx.rootRef.current;
      if (!root) return;
      const node = root.querySelector<HTMLElement>(
        `[data-nav-item-id="${itemCtx.itemId}"]`,
      );
      setTriggerRef(node);
    });

    // Floating UI placement. Horizontal menus drop down; vertical menus drop
    // logical-end (start in RTL, end in LTR). The engine's `Placement` type
    // accepts the standard 12 positions; `bottom-start` matches Stripe's
    // marketing nav muscle memory.
    const placement: Placement = ctx.orientation === 'horizontal' ? 'bottom-start' : 'right-start';

    const {
      triggerRef: floatingTriggerRef,
      floatingRef,
      placement: actualPlacement,
      floatingStyles,
    } = usePosition({
      placement,
      offset: 8,
      open: isOpen,
    });

    // Forward the trigger node into Floating UI's setReference. The hook
    // expects a ref-callback; we feed it from `triggerRefHolder` whenever it
    // changes.
    useEffect(() => {
      floatingTriggerRef(triggerRefHolder.current);
    }, [floatingTriggerRef, isOpen]);

    // Local ref to the panel for outside-click + Esc detection.
    const panelRef = useRef<HTMLDivElement | null>(null);
    const composedRef = mergeRefs<HTMLDivElement>(
      floatingRef as unknown as Ref<HTMLDivElement>,
      panelRef as unknown as Ref<HTMLDivElement>,
      forwardedRef as Ref<HTMLDivElement>,
    );

    // Esc closes. We register against the engine's escape stack so a
    // NavigationMenu nested inside a Modal closes the menu only — not the
    // outer Modal.
    const onEscape = useCallback(() => {
      ctx.setOpenItemId(null);
      // Return focus to the trigger so the user keeps their place in the menubar.
      const node = triggerRefHolder.current;
      if (node) node.focus();
    }, [ctx]);
    useEscapeStack({ active: isOpen, onEscape });

    // Outside-click closes. The Trigger is "inside" too — clicking the trigger
    // toggles the panel via the Trigger's own click handler, so the
    // outside-click hook must NOT treat the trigger as outside.
    useOutsideClick({
      active: isOpen,
      refs: [triggerRefHolder, panelRef],
      onOutside: () => ctx.setOpenItemId(null),
    });

    // When the panel mounts (open transitions false → true) AND the open was
    // triggered by keyboard, focus the first link inside. Matches the W3C
    // Menubar pattern: ArrowDown opens the panel AND moves focus into it.
    // Pointer-driven opens (click / hover) leave focus on the trigger so the
    // user's mouse intent doesn't get hijacked by a focus jump.
    useEffect(() => {
      if (!isOpen) return;
      if (ctx.lastOpenSource !== 'keyboard') return;
      const panel = panelRef.current;
      if (!panel) return;
      const firstLink = panel.querySelector<HTMLElement>(
        '[role="menuitem"], a[href], button:not([disabled])',
      );
      if (firstLink) firstLink.focus();
    }, [isOpen, ctx.lastOpenSource]);

    // Hover bridge — pointer-enter cancels any pending close so users can
    // sweep from trigger → content without the panel disappearing.
    const handlePointerEnter = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') return;
        ctx.cancelClose();
      },
      [ctx],
    );
    const handlePointerLeave = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') return;
        ctx.scheduleClose();
      },
      [ctx],
    );

    // ArrowUp / ArrowDown / ArrowLeft / ArrowRight inside the panel:
    //
    //   - ArrowDown / ArrowUp — move focus through links in document order.
    //   - ArrowLeft / ArrowRight — move to previous / next top-level item
    //     AND close the current panel (Menubar pattern). For mega-menus this
    //     is the simplest model that covers 90% of uses; columnar navigation
    //     within a mega-menu would require a separate roving-tabindex per
    //     column, which we explicitly skip in v1.
    //   - Esc — handled by `useEscapeStack` above.
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>('[role="menuitem"], a[href], button:not([disabled])'),
        );
        if (focusables.length === 0) return;

        const activeIdx = focusables.indexOf(document.activeElement as HTMLElement);

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const next = focusables[(activeIdx + 1) % focusables.length];
          next?.focus();
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const prev =
            focusables[(activeIdx - 1 + focusables.length) % focusables.length];
          prev?.focus();
          return;
        }
        if (event.key === 'Tab') {
          // Tab leaves the menubar entirely — close the panel and let the
          // browser's natural tab order take over.
          ctx.setOpenItemId(null);
          return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          // Close + focus next/prev top-level item.
          event.preventDefault();
          const items = ctx.getOrderedItems().filter((it) => !it.disabled);
          const idx = items.findIndex((it) => it.id === itemCtx.itemId);
          if (idx === -1) return;
          const isRtl = window.getComputedStyle(panel).direction === 'rtl';
          const dir =
            (event.key === 'ArrowRight' ? 1 : -1) * (isRtl ? -1 : 1) * (
              ctx.orientation === 'horizontal' ? 1 : 1
            );
          const nextIdx = (idx + dir + items.length) % items.length;
          ctx.setOpenItemId(null);
          const nextItem = items[nextIdx];
          if (nextItem) ctx.focusItem(nextItem.id);
        }
      },
      [ctx, itemCtx.itemId],
    );

    const { className: contentClass, style: contentStyle } = useThemedClasses({
      recipe: navMenuContentRecipe,
      componentName: 'NavigationMenu',
      slot: 'content',
      props: { variant, className, style },
    });

    const { className: megaClass } = useThemedClasses({
      recipe: navMenuMegaRecipe,
      componentName: 'NavigationMenu',
      slot: 'mega',
      props: { columns: String(columns) as '1' | '2' | '3' | '4' },
    });

    const surfaceStyle: CSSProperties = {
      ...floatingStyles,
      ...(contentStyle ?? {}),
    };

    const scope = useMemo<NavigationMenuContentScope>(
      () => ({ itemId: itemCtx.itemId, variant }),
      [itemCtx.itemId, variant],
    );

    // Spread the consumer's `rest` props through a widened type so Motion's
    // strict typing (e.g. `onDrag: PanHandler`) doesn't conflict with the
    // standard React `onDrag: DragEventHandler` that comes through HTMLAttributes.
    // Same trick HoverCardContent / Tooltip use; documented there.
    const motionExtraProps: Record<string, unknown> = { ...rest };

    return (
      <NavigationMenuContentItemContext.Provider value={scope}>
        <Portal>
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                ref={composedRef}
                id={itemCtx.contentId}
                /*
                 * Default (single-column) panels follow the W3C Menubar pattern
                 * — children are direct `role="menuitem"` links and `role="menu"`
                 * is the canonical container.
                 *
                 * Mega-menus use a richer hierarchy (h3 headings, grouped
                 * columns, featured slot) that doesn't fit `role="menu"`'s
                 * required-children contract. We use `role="group"` instead so
                 * the panel still announces as a logical grouping while
                 * allowing arbitrary children. Same compromise Radix's
                 * NavigationMenu Content makes for mega-menu variants.
                 */
                role={variant === 'mega' ? 'group' : 'menu'}
                aria-labelledby={itemCtx.triggerId}
                data-state="open"
                data-placement={actualPlacement}
                data-variant={variant}
                data-columns={variant === 'mega' ? columns : undefined}
                className={contentClass}
                style={surfaceStyle as never}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onKeyDown={handleKeyDown}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                {...motionExtraProps}
              >
                {variant === 'mega' ? (
                  <div className={megaClass}>{children}</div>
                ) : (
                  children
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Portal>
      </NavigationMenuContentItemContext.Provider>
    );
  },
  'NavigationMenu.Content',
);