'use client';

import {
  forwardRef,
  mergeRefs,
  useControllableState,
  useId,
  useI18n,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type Ref,
} from 'react';

import { useBreakpointBelow } from '../AppShell/useBreakpoint';

import { NavigationMenuContext } from './NavigationMenu.context';
import {
  DEFAULT_NAVIGATION_MENU_TRANSLATIONS,
  mergeNavigationMenuTranslations,
} from './NavigationMenu.i18n';
import { navMenuRootRecipe } from './NavigationMenu.recipe';
import type {
  NavigationMenuContextValue,
  NavigationMenuItemRecord,
  NavigationMenuProps,
  NavigationMenuTranslations,
} from './NavigationMenu.types';
import { NavigationMenuIndicator } from './NavigationMenuIndicator';
import { useHoverDelay } from './useHoverDelay';

/**
 * `<NavigationMenu />` — the canonical horizontal top-nav primitive.
 *
 * The root owns:
 *   - **Open dropdown id** (controlled / uncontrolled via `value` / `defaultValue`).
 *     Only one Item's dropdown is open at a time — the "menubar" pattern says
 *     so, and it makes the indicator + keyboard handler dramatically simpler.
 *   - **Focused item id** (roving tabindex). The currently-focused trigger /
 *     link gets `tabIndex={0}`; the rest get `tabIndex={-1}`. One Tab stop for
 *     the whole bar.
 *   - **Hover delay timers** for the `'hover'` / `'both'` trigger modes. The
 *     `useHoverDelay` hook owns the open + close timers; the root just wires
 *     them through context.
 *   - **Item registry** — every `<NavigationMenu.Item>` registers itself on
 *     mount so the keyboard handler / indicator can iterate items in document
 *     order.
 *   - **Mobile breakpoint** — when the viewport is below `mobileBreakpoint`,
 *     the root renders `null`. AppShell's hamburger / Drawer take over.
 *
 * The root reads `<I18nProvider>` translations via `useI18n` with a fallback to
 * the default English bundle. Consumers can also pass `translations` directly
 * for hard-coded one-offs (e.g. a marketing page that ignores the app's locale).
 *
 * @example
 *   <NavigationMenu activeHref="/pricing" indicator>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
 *       <NavigationMenu.Content>
 *         <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
 *         <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
 *       </NavigationMenu.Content>
 *     </NavigationMenu.Item>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
 *     </NavigationMenu.Item>
 *   </NavigationMenu>
 */
export const NavigationMenuRoot = forwardRef<HTMLElement, NavigationMenuProps>(
  function NavigationMenu(props, forwardedRef): ReactElement | null {
    const {
      children,
      variant = 'default',
      size = 'md',
      orientation = 'horizontal',
      trigger = 'both',
      hoverDelay = 150,
      closeDelay = 250,
      indicator = false,
      indicatorVariant = 'underline',
      activeHref,
      activeMatchStrategy = 'exact',
      defaultValue,
      value: valueProp,
      onValueChange,
      mobileBreakpoint,
      translations: translationsProp,
      ariaLabel: ariaLabelProp,
      ariaLabelledBy,
      className,
      style,
      sx,
      ...rest
    } = props;

    const [openItemId, setOpenItemIdInternal] = useControllableState<string | null>({
      // `useControllableState` matches `valueProp === undefined` to "uncontrolled";
      // null is a valid value (means "explicitly closed"), so we forward it.
      value: valueProp,
      defaultValue: defaultValue ?? null,
      onChange: onValueChange,
    });
    // Tracks how the most recent open transition was triggered. The Content
    // panel reads this to decide whether to auto-focus its first link
    // (keyboard) or stay put (pointer).
    const [lastOpenSource, setLastOpenSource] = useState<'pointer' | 'keyboard'>('pointer');
    const setOpenItemId = useCallback(
      (next: string | null, source: 'pointer' | 'keyboard' = 'pointer') => {
        if (next !== null) setLastOpenSource(source);
        setOpenItemIdInternal(next);
      },
      [setOpenItemIdInternal],
    );

    // Roving tabindex — the currently-focused trigger / link.
    const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

    const baseId = useId();

    // Item registry. We use a ref-backed Map so registrations don't trigger
    // re-renders by themselves, paired with a `registryVersion` state that
    // gets bumped on register / unregister. Subparts re-render through the
    // version state so reads from `itemsRef.current` always return the latest
    // snapshot — without bouncing every key press through React state updates.
    const itemsRef = useRef<Map<string, NavigationMenuItemRecord>>(new Map());
    const [, setRegistryVersion] = useState(0);

    const registerItem = useCallback((record: NavigationMenuItemRecord) => {
      itemsRef.current.set(record.id, record);
      setRegistryVersion((v) => v + 1);
      return () => {
        itemsRef.current.delete(record.id);
        setRegistryVersion((v) => v + 1);
      };
    }, []);

    const updateItem = useCallback(
      (id: string, patch: Partial<NavigationMenuItemRecord>) => {
        const existing = itemsRef.current.get(id);
        if (!existing) return;
        itemsRef.current.set(id, { ...existing, ...patch });
      },
      [],
    );

    const getOrderedItems = useCallback((): NavigationMenuItemRecord[] => {
      // Sort by document position so consumers can render items conditionally /
      // out of source order without confusing the keyboard handler.
      const records = Array.from(itemsRef.current.values()).filter(
        (rec) => rec.ref.current !== null,
      );
      records.sort((a, b) => {
        const aNode = a.ref.current!;
        const bNode = b.ref.current!;
        const position = aNode.compareDocumentPosition(bNode);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      return records;
    }, []);

    const focusItem = useCallback((id: string) => {
      const record = itemsRef.current.get(id);
      const node = record?.ref.current;
      if (!node) return;
      node.focus();
      // The trigger / link's onFocus handler will sync `focusedItemId` — but
      // doing it here too means programmatic focus works even if the focus event
      // is suppressed (e.g. during a keyboard test in jsdom).
      setFocusedItemId(id);
    }, []);

    // Hover delay machinery. The root owns it because items need to coordinate
    // (sweeping from one trigger to another should swap the open id without
    // closing first), and the Content panel needs to cancel the close on enter.
    const handleHoverOpen = useCallback(
      (id: string) => {
        // Only items WITH a Content panel respond to hover-open. Items with just
        // a Link (no panel) shouldn't open anything; the registration record's
        // `hasContent` flag tells us.
        const record = itemsRef.current.get(id);
        if (!record?.hasContent) return;
        setOpenItemId(id);
      },
      [setOpenItemId],
    );
    const handleHoverClose = useCallback(() => {
      setOpenItemId(null);
    }, [setOpenItemId]);

    const hover = useHoverDelay({
      openDelay: hoverDelay,
      closeDelay,
      onOpen: handleHoverOpen,
      onClose: handleHoverClose,
    });

    // Wrap the schedule helpers so trigger mode gates them — `'click'` mode
    // shouldn't react to hover at all (matches Radix's NavigationMenu surface).
    const scheduleOpen = useCallback(
      (id: string) => {
        if (trigger === 'click') return;
        hover.scheduleOpen(id);
      },
      [trigger, hover],
    );
    const scheduleClose = useCallback(() => {
      if (trigger === 'click') return;
      hover.scheduleClose();
    }, [trigger, hover]);

    // i18n — read from the engine's I18nProvider when available, fall back to
    // the default English bundle. `useI18n()` returns `null` when no provider
    // is mounted, in which case `get()` is unavailable; the optional chaining
    // makes the no-provider path zero-allocation.
    const i18n = useI18n();
    const providerTranslations = i18n
      ? i18n.get<Partial<NavigationMenuTranslations>>('navigationMenu')
      : undefined;
    const translations = useMemo<NavigationMenuTranslations>(
      () =>
        mergeNavigationMenuTranslations(
          mergeNavigationMenuTranslations(DEFAULT_NAVIGATION_MENU_TRANSLATIONS, providerTranslations),
          translationsProp,
        ),
      [providerTranslations, translationsProp],
    );

    // Local ref to the root `<nav>` so the Indicator can measure offsets.
    const localRootRef = useRef<HTMLElement | null>(null);
    const composedRootRef = mergeRefs<HTMLElement>(
      localRootRef as unknown as Ref<HTMLElement>,
      forwardedRef as Ref<HTMLElement>,
    );

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: navMenuRootRecipe,
      componentName: 'NavigationMenu',
      slot: 'root',
      props: { orientation, size, className, sx, style },
    });

    const ctxValue = useMemo<NavigationMenuContextValue>(
      () => ({
        baseId,
        orientation,
        variant,
        size,
        trigger,
        hoverDelay,
        closeDelay,
        openItemId: openItemId ?? null,
        setOpenItemId,
        lastOpenSource,
        focusedItemId,
        focusItem,
        setFocusedItemId,
        registerItem,
        updateItem,
        getOrderedItems,
        scheduleOpen,
        scheduleClose,
        cancelClose: hover.cancelClose,
        activeHref,
        activeMatchStrategy,
        indicator,
        indicatorVariant,
        rootRef: localRootRef,
        translations,
      }),
      [
        baseId,
        orientation,
        variant,
        size,
        trigger,
        hoverDelay,
        closeDelay,
        openItemId,
        setOpenItemId,
        lastOpenSource,
        focusedItemId,
        focusItem,
        registerItem,
        updateItem,
        getOrderedItems,
        scheduleOpen,
        scheduleClose,
        hover.cancelClose,
        activeHref,
        activeMatchStrategy,
        indicator,
        indicatorVariant,
        translations,
      ],
    );

    // Mobile breakpoint check — must be called every render (Hooks rules).
    // When `mobileBreakpoint` is undefined we pass a sentinel and ignore the
    // result; the hook is cheap and SSR-safe.
    const isMobile = useBreakpointBelow(mobileBreakpoint ?? 'sm');
    const shouldHide = mobileBreakpoint !== undefined && isMobile;

    if (shouldHide) return null;

    const ariaLabel = ariaLabelProp ?? translations.label;

    return (
      <NavigationMenuContext.Provider value={ctxValue}>
        <nav
          ref={composedRootRef}
          className={rootClass}
          style={rootStyle ?? undefined}
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          data-orientation={orientation}
          data-variant={variant}
          data-size={size}
          {...rest}
        >
          <ul
            role="menubar"
            aria-orientation={orientation}
            aria-label={ariaLabelledBy ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledBy}
            data-nav-menu-list=""
            className="contents"
          >
            {children}
          </ul>
          {indicator ? <NavigationMenuIndicator /> : null}
        </nav>
      </NavigationMenuContext.Provider>
    );
  },
  'NavigationMenu',
);