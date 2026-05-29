'use client';

import { Slot, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { type KeyboardEvent } from 'react';

import { cardRecipes } from './Card.recipe';
import { CardContext } from './CardContext';
import type { CardOrientation, CardProps, CardSize } from './Card.types';

/**
 * The DS's first **compound** primitive. Root `<Card>` paints the shell (variant / shape / ring /
 * elevation), pipes `size` + `orientation` to subparts via `CardContext`, and optionally promotes
 * itself into a focusable, keyboard-activatable click target via `clickable`.
 *
 * Card is the canonical reference for every future compound component (Tabs, Accordion, Modal,
 * Drawer) — the namespace lives in `./index.ts` via `Object.assign(Card, { Header, Body, … })`
 * so consumers reach for `<Card.Header>` exactly as they would `<Tabs.List>`.
 *
 * @example
 *   <Card>
 *     <Card.Header title="Project Apollo" subtitle="Updated 3 min ago" />
 *     <Card.Body>The mission is to put humans on the moon.</Card.Body>
 *     <Card.Footer><Button>Save</Button></Card.Footer>
 *   </Card>
 *
 *   <Card clickable hoverable color="primary" onClick={openPanel}>…</Card>
 *   <Card asChild><a href="/posts/1">…</a></Card>
 */
export const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const {
    variant,
    size,
    color,
    shape,
    orientation,
    hoverable = false,
    clickable = false,
    disabled = false,
    selected = false,
    asChild = false,
    className,
    style,
    sx,
    children,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    ...rest
  } = props;

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: cardRecipes.root,
    componentName: 'Card',
    slot: 'root',
    props: {
      variant,
      size,
      color,
      shape,
      orientation,
      hoverable,
      clickable,
      selected,
      className,
      sx,
      style,
    },
  });

  const interactive = clickable && !disabled;
  // Keyboard activation for `clickable` Cards. Native `<button>` semantics for free without
  // forcing consumers to switch to `asChild`. Enter/Space match `<button>`'s default behavior.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  };

  const handleClick: typeof onClick = (event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  // Children with non-string `size` / `orientation` (responsive values) fall back to the base
  // breakpoint for context propagation. Subpart layout responds to its own breakpoint via the
  // recipe; context only needs the discrete value for `Card.Media` orientation switching.
  const contextValue = {
    size: resolveSize(size),
    orientation: resolveOrientation(orientation),
  };

  // The data-* attributes surface state to CSS selectors used by overrides + tests, and let
  // assistive tech / inspectors see the active condition without diffing class strings.
  const dataAttrs = {
    'data-disabled': disabled ? 'true' : undefined,
    'data-selected': selected ? 'true' : undefined,
    'data-clickable': clickable ? 'true' : undefined,
    'data-hoverable': hoverable ? 'true' : undefined,
  };

  const styleProp = rootStyle ?? undefined;

  if (asChild) {
    // When wrapping a custom element (typically `<a>` or `<button>`), let the wrapped element
    // own its native role/tabIndex. We still emit data-* + keydown handling so a wrapping
    // `<button>` behaves like a `clickable` Card without rewiring keyboard handling on the
    // consumer side.
    return (
      <CardContext.Provider value={contextValue}>
        <Slot
          ref={ref}
          className={rootClass}
          style={styleProp}
          aria-disabled={disabled || undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...dataAttrs}
          {...rest}
        >
          {children}
        </Slot>
      </CardContext.Provider>
    );
  }

  return (
    <CardContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={rootClass}
        style={styleProp}
        role={interactive ? (role ?? 'button') : role}
        tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
        aria-disabled={disabled || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...dataAttrs}
        {...rest}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}, 'Card');

function resolveSize(value: CardProps['size']): CardSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, CardSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

function resolveOrientation(value: CardProps['orientation']): CardOrientation {
  if (value === undefined) return 'vertical';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, CardOrientation>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'vertical';
  }
  return 'vertical';
}
