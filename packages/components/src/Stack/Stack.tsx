'use client';

import { Slot, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { createElement } from 'react';

import { gapClasses } from './gapClasses';
import { stackChildrenWithDivider } from './stackChildrenWithDivider';
import { stackRecipe } from './Stack.recipe';
import type { StackProps } from './Stack.types';

/**
 * `<Stack>` — the canonical flex container primitive.
 *
 * Stack has **no visual variants**. It's invisible by design: a `<div>` (or any other element via
 * `as` / `asChild`) styled with the layout classes that match its prop axes. Stack composes:
 *
 *   - `direction` / `align` / `justify` / `wrap` / `inline` / `fullWidth` — `cv`-driven recipe axes
 *     with native `ResponsiveValue<T>` support (`{ base: 'column', md: 'row' }` → `flex-col md:flex-row`).
 *   - `gap` / `rowGap` / `columnGap` — resolved by a tiny separate helper because they split into
 *     `gap-*` / `gap-x-*` / `gap-y-*` when overrides are present.
 *   - `divider` — auto-inserted between non-Spacer children via a pure transform.
 *   - `as` / `asChild` — polymorphic root via `createElement` or `<Slot>` from the engine.
 *
 * @example
 *   <Stack gap={4}>
 *     <Card>One</Card>
 *     <Card>Two</Card>
 *   </Stack>
 *
 *   <Stack direction="row" gap={{ base: 2, md: 4 }} align="center">
 *     <Avatar src={user.avatar} />
 *     <span>{user.name}</span>
 *     <Spacer />
 *     <Button>Edit</Button>
 *   </Stack>
 *
 *   <Stack as="ul" gap={1} divider={<hr />}>
 *     {items.map((item) => <li key={item.id}>{item.label}</li>)}
 *   </Stack>
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(props, ref) {
  const {
    direction,
    align,
    justify,
    gap,
    rowGap,
    columnGap,
    wrap,
    divider,
    fullWidth,
    inline,
    as,
    asChild,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  // Dev-mode guard: `as` + `asChild` cannot coexist. `asChild` already supplies the rendered
  // element via its single child; `as` would override the child's element type silently. This
  // mirrors Card / Button / Toggle's behavior and the Radix convention.
  if (process.env.NODE_ENV !== 'production' && as && asChild) {
    console.warn(
      '[Stack] `as` and `asChild` are mutually exclusive. Drop one — `asChild` takes precedence.',
    );
  }

  const { className: recipeCls, style: recipeStyle } = useThemedClasses({
    recipe: stackRecipe,
    componentName: 'Stack',
    props: {
      direction,
      align,
      justify,
      wrap,
      inline,
      fullWidth,
      className,
      sx,
      style,
    },
  });

  const gapCls = gapClasses(gap, rowGap, columnGap);
  // tailwind-merge inside `cn` (already used by `useThemedClasses`) handles ordering correctly,
  // but we keep `recipeCls` first + `gapCls` last so consumer-supplied `className` (already
  // appended inside the recipe call) still wins for matching utilities.
  const mergedClassName = gapCls ? `${recipeCls} ${gapCls}` : recipeCls;

  const finalChildren = stackChildrenWithDivider(children, divider);
  const styleProp = recipeStyle ?? undefined;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={mergedClassName}
        style={styleProp}
        {...(rest as Record<string, unknown>)}
      >
        {finalChildren}
      </Slot>
    );
  }

  // `createElement` instead of JSX so `as` can flow naturally to the rendered tag without React
  // complaining about a dynamic component type. The function form is also a hair faster than
  // JSX's createElement wrapper (no JSX transform overhead).
  return createElement(
    as ?? 'div',
    {
      ref,
      className: mergedClassName,
      style: styleProp,
      ...rest,
    },
    finalChildren,
  );
}, 'Stack');