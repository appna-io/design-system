'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { createElement, type ForwardedRef, type ReactElement } from 'react';

import { dividerLabeledRecipe, dividerRuleRecipe } from './Divider.recipe';
import type {
  DividerColor,
  DividerOrientation,
  DividerProps,
  DividerThickness,
  DividerVariant,
} from './Divider.types';

/**
 * `<Divider />` — the canonical separator primitive. Two shapes under one API:
 *
 *  - **Rule** (no `children`) — renders an `<hr>` (or `as=` element) styled via
 *    `dividerRuleRecipe`. Native `<hr>` carries `role="separator"` already, so a11y is free.
 *  - **Labeled** (with `children`) — renders a `<div role="separator">` containing two
 *    `<span aria-hidden>` rules and the label between them. `<hr>` cannot wrap children, so
 *    the element flips automatically.
 *
 * Why a polymorphic `as` prop instead of `Slot`? `<hr>`-vs-`<div>` is a real semantic
 * difference (one is a void element, the other isn't). The `as` prop lets a consumer pin the
 * element explicitly (e.g. `<Divider as="li">` inside a `<ul role="menu">`), while the default
 * stays automatic based on the labeled / unlabeled shape.
 *
 * `decorative={true}` switches the role to `presentation` (or sets `aria-hidden`) for cases
 * where a surrounding region already conveys the section boundary — common inside Cards that
 * already have a labeled header.
 */
function DividerImpl(
  props: DividerProps,
  ref: ForwardedRef<HTMLElement>,
): ReactElement {
  const {
    orientation: orientationProp = 'horizontal',
    variant: variantProp = 'solid',
    thickness: thicknessProp = 1,
    color: colorProp = 'subtle',
    labelPosition = 'center',
    decorative = false,
    as,
    children,
    className,
    style,
    sx,
    role: roleProp,
    'aria-orientation': ariaOrientationProp,
    'aria-hidden': ariaHiddenProp,
    ...rest
  } = props;

  const orientation: DividerOrientation = orientationProp;
  const variant: DividerVariant = variantProp;
  const thickness: DividerThickness = thicknessProp;
  const color: DividerColor = colorProp;

  const isLabeled = children !== undefined && children !== null && children !== false && children !== '';

  // Decorative dividers get `role="presentation"` + `aria-hidden="true"`. Non-decorative
  // labeled dividers need an explicit `role="separator"` because we render a `<div>` (not the
  // implicitly-roled `<hr>`). The unlabeled `<hr>` path leaves the role unset so the native
  // element carries `role="separator"` itself.
  const ariaRole = (() => {
    if (roleProp !== undefined) return roleProp;
    if (decorative) return 'presentation';
    if (isLabeled || as !== undefined) return 'separator';
    return undefined;
  })();

  const ariaOrientation = (() => {
    if (ariaOrientationProp !== undefined) return ariaOrientationProp;
    if (ariaRole === 'presentation') return undefined;
    // Spec says `aria-orientation`'s default for `separator` is `horizontal`, so we only emit
    // it when the divider is vertical (saves a few bytes per render and matches Radix).
    return orientation === 'vertical' ? 'vertical' : undefined;
  })();

  const ariaHidden = ariaHiddenProp ?? (decorative ? true : undefined);

  // ───── All hooks called unconditionally, in stable order ────────────────────────────────
  // React's rules-of-hooks require every hook to fire in the same order every render. We
  // resolve **both** the rule recipe and the labeled-wrapper recipe up front; the unused
  // branch is a few microseconds of cheap class merging.
  const { className: ruleClass, style: ruleStyle } = useThemedClasses({
    recipe: dividerRuleRecipe,
    componentName: 'Divider',
    slot: 'rule',
    props: {
      orientation,
      variant,
      thickness: String(thickness),
      color,
      className,
      sx,
      style,
    },
  });

  const { className: wrapperClass, style: wrapperStyle } = useThemedClasses({
    recipe: dividerLabeledRecipe,
    componentName: 'Divider',
    slot: 'labeled',
    props: { labelPosition, className, sx, style },
  });

  const { className: lineBase } = useThemedClasses({
    recipe: dividerRuleRecipe,
    componentName: 'Divider',
    slot: 'rule',
    // The flank-span recipe is always horizontal — labeled dividers don't go vertical (a
    // vertical labeled rule is a pathological visual that no consumer needs in V1).
    props: {
      orientation: 'horizontal',
      variant,
      thickness: String(thickness),
      color,
    },
  });

  // The accessible-name algorithm for `role="separator"` is "name from author" — without an
  // explicit `aria-label` / `aria-labelledby` reference, screen readers fall back to no name
  // (the spec leaves "name from content" optional, and dom-accessibility-api / Testing
  // Library do not include it). We tie the wrapper to the inner label span via
  // `aria-labelledby` so the label is always announced as the separator's accessible name.
  const labelId = useId();

  // ───── Unlabeled (rule) path ─────────────────────────────────────────────────────────────
  if (!isLabeled) {
    const Element = as ?? 'hr';

    return createElement(
      Element,
      {
        ref,
        className: ruleClass,
        style: ruleStyle ?? undefined,
        ...(ariaRole !== undefined ? { role: ariaRole } : {}),
        ...(ariaOrientation !== undefined ? { 'aria-orientation': ariaOrientation } : {}),
        ...(ariaHidden !== undefined ? { 'aria-hidden': ariaHidden } : {}),
        'data-orientation': orientation,
        'data-thickness': String(thickness),
        ...rest,
      },
    );
  }

  // ───── Labeled path ──────────────────────────────────────────────────────────────────────
  // The wrapper is a `<div>` (or `as` override). Two `<span aria-hidden>` siblings flank the
  // label and each carries the same rule classes the `<hr>` form would — color / variant /
  // thickness all flow through. Each span sets `flex-1` so they fill the remaining space; the
  // `labelPosition` axis decides which span (if any) collapses to zero width.
  const Element = as ?? 'div';

  const leadingHidden = labelPosition === 'start';
  const trailingHidden = labelPosition === 'end';

  return createElement(
    Element,
    {
      ref,
      className: wrapperClass,
      style: wrapperStyle ?? undefined,
      ...(ariaRole !== undefined ? { role: ariaRole } : {}),
      ...(ariaOrientation !== undefined ? { 'aria-orientation': ariaOrientation } : {}),
      ...(ariaHidden !== undefined ? { 'aria-hidden': ariaHidden } : {}),
      ...(ariaRole === 'separator' ? { 'aria-labelledby': labelId } : {}),
      'data-orientation': orientation,
      'data-thickness': String(thickness),
      'data-label-position': labelPosition,
      ...rest,
    },
    <span
      aria-hidden="true"
      className={`${lineBase} ${leadingHidden ? 'hidden' : 'flex-1'}`}
      data-divider-line="leading"
    />,
    <span id={labelId} data-divider-label>{children}</span>,
    <span
      aria-hidden="true"
      className={`${lineBase} ${trailingHidden ? 'hidden' : 'flex-1'}`}
      data-divider-line="trailing"
    />,
  );
}

export const Divider = forwardRef<HTMLElement, DividerProps>(DividerImpl, 'Divider');