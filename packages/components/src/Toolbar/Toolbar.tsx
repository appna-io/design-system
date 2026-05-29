'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import { Button } from '../Button/Button';
import { Popover } from '../Popover';
import { applyTooltipsToChildren } from './applyTooltips';
import { ToolbarContext } from './Toolbar.context';
import { toolbarRecipe } from './Toolbar.recipe';
import type {
  ToolbarAlign,
  ToolbarContextValue,
  ToolbarOrientation,
  ToolbarProps,
  ToolbarSize,
  ToolbarVariant,
} from './Toolbar.types';
import { useToolbarKeyboard } from './useToolbarKeyboard';
import { useToolbarOverflow } from './useToolbarOverflow';

/**
 * Gap-in-pixels lookup for the resolved `size`. Used by `useToolbarOverflow.measure` to space
 * children correctly during the width walk. Sourced from Tailwind's default spacing scale —
 * `gap-0.5 = 2px`, `gap-1 = 4px`, `gap-1.5 = 6px`. If we ever theme spacing, this table moves
 * to a theme-driven lookup; until then literal pixels match the recipe's literal Tailwind
 * utility output and avoid an extra `getComputedStyle` call per render.
 */
const SIZE_TO_GAP_PX: Record<ToolbarSize, number> = {
  sm: 2,
  md: 4,
  lg: 6,
};

/**
 * `<Toolbar>` — composes Buttons, Toggles, ToggleGroups, Menus, and other focusable controls
 * into an accessible action rail.
 *
 * What Toolbar contributes:
 *
 *   - **W3C Toolbar pattern**: `role="toolbar"` + `aria-orientation` + a roving tabindex so
 *     the whole toolbar is one Tab stop and arrow keys move focus between items. RTL-aware
 *     arrow flipping is read at handle-time, not at mount, so toggling `dir` at runtime works.
 *   - **Single accessible name**: `aria-label` or `aria-labelledby` is required (dev warning
 *     emitted when missing — axe-core rejects unlabelled toolbars).
 *   - **Visual chrome**: `variant='default' | 'bordered' | 'floating'` styles the container
 *     only; children look exactly as they would standalone.
 *   - **Optional overflow handling**: `overflow='menu'` uses a ResizeObserver to measure
 *     children width and moves trailing items into a `<Menu>` "more actions" dropdown when
 *     the toolbar runs out of horizontal space. Off by default (opt-in observer cost).
 *   - **Optional tooltip enrichment**: `applyTooltips` wraps iconic children (`aria-label` +
 *     no visible text) in `<Tooltip>` so hovering reveals the label. Off by default.
 *
 * What Toolbar deliberately does NOT do:
 *
 *   - Style child controls. The size axis contributes a gap rhythm only; per-child `size`
 *     props still win.
 *   - Manage focus inside nested ToggleGroups beyond the flat roving order. When a toolbar
 *     captures arrow keys, the group's own arrow handling is suppressed in favour of the
 *     toolbar's flat order — the W3C-canonical behavior for nested toolbar items.
 *
 * @example Basic editor toolbar with two toggle groups and a primary button.
 *   <Toolbar aria-label="Text formatting">
 *     <ToggleGroup type="multiple" aria-label="Style">
 *       <ToggleGroup.Item value="bold" aria-label="Bold"><BoldIcon /></ToggleGroup.Item>
 *       <ToggleGroup.Item value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroup.Item>
 *     </ToggleGroup>
 *     <Toolbar.Separator />
 *     <Button variant="solid">Publish</Button>
 *   </Toolbar>
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(props, ref) {
  const {
    orientation: orientationProp,
    variant: variantProp,
    size: sizeProp,
    align: alignProp,
    overflow = 'none',
    overflowLabel = 'More actions',
    applyTooltips = false,
    loop = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  // Resolve the axes once for downstream consumers — keyboard / overflow / context don't need
  // responsive values; only the recipe does. We re-derive scalars here for the gap-px lookup,
  // orientation switch, and context handoff.
  const orientation = resolveOrientation(orientationProp);
  const size = resolveSize(sizeProp);

  // Loud dev warn so unlabeled toolbars don't slip past axe / consumer review. We accept both
  // labelling shapes (label + labelledby) because consumers sometimes attach their own visible
  // heading via an external id.
  warn(
    Boolean(ariaLabel) || Boolean(ariaLabelledBy),
    '<Toolbar> needs `aria-label` or `aria-labelledby` for screen reader users.',
    'TOOLBAR_NO_LABEL',
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Stable forwarded ref glue — keeps the consumer's ref + our internal ref both populated.
  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  // Apply tooltip enrichment FIRST so the resulting child list is what the overflow logic
  // measures. Wrapping in Tooltip turns each iconic child into a `<Tooltip>...</Tooltip>` —
  // the outer width is the same as the bare button (Tooltip itself is portal-rendered) so the
  // measurements stay accurate.
  const enrichedChildren = useMemo<ReactNode>(() => {
    if (!applyTooltips) return children;
    return applyTooltipsToChildren(children, {
      placement: orientation === 'horizontal' ? 'bottom' : 'right',
    });
  }, [applyTooltips, children, orientation]);

  const childArray = useMemo(() => Children.toArray(enrichedChildren), [enrichedChildren]);

  // Render token — bumps when the inline child list could have changed. Drives both the
  // roving-tabindex pass and the overflow re-measure as effect dependencies.
  const renderToken = childArray.length;

  const overflowCount = useToolbarOverflow({
    enabled: overflow === 'menu' && orientation === 'horizontal',
    rootRef,
    itemsContainerRef,
    triggerRef,
    gap: SIZE_TO_GAP_PX[size],
    renderToken,
  });

  // Roving tabindex + arrow / Home / End keyboard handling come from the engine's
  // `useRovingTabindexDom`. The Toolbar-shaped wrapper (`useToolbarKeyboard`) configures it
  // with `skipBoundarySelector='[data-toolbar-skip="true"]'` and `observe=true` so children
  // that overwrite their own `tabindex` (notably `<ToggleGroup.Item>` in single mode) can't
  // break the flat roving order. Phase 58 RFC #1 extraction; behavior unchanged.
  const onKeyDownCapture = useToolbarKeyboard({ rootRef, orientation, loop, renderToken });

  // Split the children into inline + overflowed sets. When overflow is off, all children stay
  // inline (overflowCount is 0). When on, the trailing N children are routed into the menu.
  const inlineCount = Math.max(0, childArray.length - overflowCount);
  const inlineChildren = childArray.slice(0, inlineCount);
  const overflowChildren = childArray.slice(inlineCount);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: toolbarRecipe,
    componentName: 'Toolbar',
    props: {
      orientation: orientationProp,
      variant: variantProp,
      size: sizeProp,
      align: alignProp,
      className,
      sx,
      style,
    },
  });

  const ctxValue: ToolbarContextValue = useMemo(
    () => ({ orientation, size }),
    [orientation, size],
  );

  // Build the labelling props explicitly — `exactOptionalPropertyTypes` rejects spreading a
  // `string | undefined` ARIA attribute, and we want to omit the key entirely when undefined.
  const ariaProps: { 'aria-label'?: string; 'aria-labelledby'?: string } = {};
  if (ariaLabel) ariaProps['aria-label'] = ariaLabel;
  if (ariaLabelledBy) ariaProps['aria-labelledby'] = ariaLabelledBy;

  // When overflow is active, we render an extra trailing trigger that hosts a `<Menu>` with
  // the overflowed items. The trigger lives outside the items container so the overflow
  // hook's measurement (`itemsContainer.children`) doesn't count it as an inline item.
  const showOverflowMenu = overflow === 'menu' && orientation === 'horizontal' && overflowCount > 0;

  return (
    <ToolbarContext.Provider value={ctxValue}>
      <div
        ref={setRootRef}
        role="toolbar"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-variant={resolveVariant(variantProp)}
        className={rootClass}
        style={rootStyle ?? undefined}
        onKeyDownCapture={onKeyDownCapture}
        {...ariaProps}
        {...rest}
      >
        {/*
          Items container — only the toolbar's direct children participate in overflow
          measurement. The container itself is `display: contents` so it doesn't add a flex
          row of its own (which would defeat the toolbar's gap-* utility on the outer flex).
        */}
        <div
          ref={itemsContainerRef}
          data-toolbar-items=""
          style={{ display: 'contents' }}
        >
          {inlineChildren}
        </div>

        {showOverflowMenu ? (
          <div ref={triggerRef} data-toolbar-skip="true" style={{ display: 'contents' }}>
            <Popover>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size={size === 'lg' ? 'md' : 'sm'}
                  aria-label={overflowLabel}
                  aria-haspopup="menu"
                >
                  {/* Three-dot glyph as inline SVG — keeps the trigger fully self-contained
                      without depending on an Icon library we don't ship yet. */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="3" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                </Button>
              </Popover.Trigger>
              <Popover.Content placement="bottom-end" className="flex flex-col gap-1 p-1 min-w-[10rem]">
                {overflowChildren}
              </Popover.Content>
            </Popover>
          </div>
        ) : null}
      </div>
    </ToolbarContext.Provider>
  );
}, 'Toolbar');

function resolveOrientation(value: ToolbarProps['orientation']): ToolbarOrientation {
  if (value === undefined) return 'horizontal';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToolbarOrientation>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'horizontal';
  }
  return 'horizontal';
}

function resolveSize(value: ToolbarProps['size']): ToolbarSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToolbarSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

function resolveVariant(value: ToolbarProps['variant']): ToolbarVariant {
  if (value === undefined) return 'default';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToolbarVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'default';
  }
  return 'default';
}

// Re-export the resolved axes so consumers can type their own conditional logic without
// reimporting from `./Toolbar.types`.
export type { ToolbarAlign, ToolbarOrientation, ToolbarSize, ToolbarVariant };
