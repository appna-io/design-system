'use client';

import { forwardRef, mergeRefs, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import {
  NavigationMenuItemContext,
  useNavigationMenuContext,
  type NavigationMenuItemContextValue,
} from './NavigationMenu.context';
import { navMenuItemRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuItemProps, NavigationMenuItemRecord } from './NavigationMenu.types';

/**
 * `<NavigationMenu.Item>` — the structural wrapper for a single top-level entry.
 *
 * The Item is `<li role="none">` (the "menubar" pattern uses `role="none"` on
 * the `<li>` because the focusable child carries `role="menuitem"`). It owns:
 *
 *   - **Item registration** — registers itself with the root's item registry
 *     on mount (and unregisters on unmount). The registry lets the keyboard
 *     handler iterate items in document order without a `Children.toArray`
 *     traversal of the React tree.
 *   - **The item-scoped ref** — Trigger / Link forward their DOM node here so
 *     the registry has a node to `focus()` when the keyboard moves between
 *     items. The Item itself is structural and not focusable.
 *   - **Has-content detection** — if a `<NavigationMenu.Content>` is found in
 *     children, the registration record's `hasContent` flag is `true`. The
 *     keyboard handler / hover delay logic uses this to decide whether
 *     ArrowDown should open a panel.
 *   - **Item-scoped ids** — `triggerId` and `contentId` for `aria-controls` ↔
 *     `aria-labelledby` pairing between the Trigger button and the Content
 *     panel, mirrored to the consumer-supplied `value` so consumers can refer
 *     to items by id externally.
 */
export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem(props, forwardedRef) {
    const { children, value, disabled = false, className, style, ...rest } = props;

    const ctx = useNavigationMenuContext('NavigationMenu.Item');
    const generatedId = useId();
    const itemId = value ?? generatedId;

    const triggerId = `${ctx.baseId}-trigger-${itemId}`;
    const contentId = `${ctx.baseId}-content-${itemId}`;

    // Track the focusable child's DOM node for the registry. Trigger / Link
    // both feed this via `setItemNode`. We default to a simple ref (set by the
    // consumer's element through the item context) so the keyboard handler can
    // call `node.focus()` on it.
    const itemNodeRef = useRef<HTMLElement | null>(null);
    const setItemNode = useCallback((node: HTMLElement | null) => {
      itemNodeRef.current = node;
    }, []);

    // Walk children to detect whether this Item has a Content panel. We
    // intentionally do this with a name-equality check (against
    // `NavigationMenuContent.displayName`) because importing the component
    // here would create a circular dependency. The fallback is a duck check on
    // the `data-nav-menu-content-marker` prop the Content component sets on
    // itself — that survives Babel renaming.
    const hasContent = detectContent(children);

    // Auto-resolve a label for type-to-search by walking children for a
    // Trigger / Link's text content. Falls back to "" (always-mismatch).
    const initialLabel = useMemo(() => extractLabel(children), [children]);
    const labelRef = useRef(initialLabel);
    labelRef.current = initialLabel;

    // Compute the registration record. We hold it in a ref so the live values
    // (label / disabled / hasContent) update without re-firing the
    // register/unregister effect on every render.
    const recordRef = useRef<NavigationMenuItemRecord>({
      id: itemId,
      ref: itemNodeRef,
      hasContent,
      disabled,
      href: undefined,
      label: initialLabel,
    });
    recordRef.current.id = itemId;
    recordRef.current.hasContent = hasContent;
    recordRef.current.disabled = disabled;
    recordRef.current.label = initialLabel;

    const { registerItem, updateItem } = ctx;
    useEffect(() => {
      const unregister = registerItem(recordRef.current);
      return () => {
        unregister();
      };
    }, [registerItem, itemId]);

    // Push label / disabled / hasContent updates into the registry on change.
    useEffect(() => {
      updateItem(itemId, { label: initialLabel, disabled, hasContent });
    }, [updateItem, itemId, initialLabel, disabled, hasContent]);

    const itemCtx = useMemo<NavigationMenuItemContextValue>(
      () => ({
        itemId,
        disabled,
        triggerId,
        contentId,
        setItemNode,
      }),
      [itemId, disabled, triggerId, contentId, setItemNode],
    );

    const { className: itemClass, style: itemStyle } = useThemedClasses({
      recipe: navMenuItemRecipe,
      componentName: 'NavigationMenu',
      slot: 'item',
      props: { orientation: ctx.orientation, className, style },
    });

    return (
      <NavigationMenuItemContext.Provider value={itemCtx}>
        <li
          ref={mergeRefs<HTMLLIElement>(forwardedRef as Ref<HTMLLIElement>)}
          role="none"
          className={itemClass}
          style={itemStyle ?? undefined}
          data-nav-menu-item=""
          data-disabled={disabled ? 'true' : undefined}
          {...rest}
        >
          {children}
        </li>
      </NavigationMenuItemContext.Provider>
    );
  },
  'NavigationMenu.Item',
);

/**
 * Walks the children once to detect a `<NavigationMenu.Content>` child. We test
 * by displayName (the component sets `displayName = 'NavigationMenu.Content'`)
 * because importing the actual component creates a circular import. This is the
 * same pattern Sidebar uses to detect `<Sidebar.SubItems>` children.
 */
function detectContent(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found) return;
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string } | string;
    if (typeof type === 'string') return;
    if (type.displayName === 'NavigationMenu.Content') found = true;
  });
  return found;
}

/**
 * Extracts a string label from the Item's children. We look at the first
 * Trigger / Link descendant and read its `textContent` equivalent — for
 * type-to-search we just need a stable lowercase prefix to match against.
 *
 * The lookup is intentionally shallow + cheap: we only inspect direct children
 * of the Item, then their direct children. Anything more elaborate is the
 * consumer's responsibility (they can pass a `value` and react to keypresses
 * themselves if they have a deeply nested label).
 */
function extractLabel(children: ReactNode): string {
  let label = '';
  const walk = (node: ReactNode, depth: number): void => {
    if (label !== '') return;
    if (depth > 4) return;
    if (typeof node === 'string') {
      label = node.trim();
      return;
    }
    if (typeof node === 'number') {
      label = String(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child, depth + 1);
        if (label !== '') return;
      }
      return;
    }
    if (isValidElement(node)) {
      const type = node.type as { displayName?: string } | string;
      const displayName = typeof type === 'string' ? type : type.displayName;
      // Only descend into Trigger / Link / inline children — skip Content so
      // mega-menu link text doesn't bleed into the top-level label.
      if (displayName === 'NavigationMenu.Content') return;
      const props = node.props as { children?: ReactNode };
      walk(props.children, depth + 1);
    }
  };
  walk(children, 0);
  return label;
}

interface NavigationMenuItemElement extends ReactElement<NavigationMenuItemProps> {
  type: typeof NavigationMenuItem;
}
export type { NavigationMenuItemElement };
