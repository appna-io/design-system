'use client';

import {
  Slot,
  cn,
  forwardRef,
  motionPresets,
  sxToStyle,
  useReducedMotion,
  warn,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { motion } from 'motion/react';
import { createElement, type CSSProperties, type ElementType } from 'react';

import { divRecipe } from './Div.recipe';
import { buildGradientBackground } from './gradient';
import { buildPseudoClassName, type PseudoPropMap } from './pseudoProps';
import { extractStyleProps } from './styleProps';
import type { DivProps } from './Div.types';

/**
 * `<Div />` — the canonical styling primitive.
 *
 * A "MUI Box" / "Chakra Box" equivalent built on the DS's existing engine pieces. Wraps a single
 * intrinsic element (default `<div>`) with a flat-prop styling surface, responsive show/hide,
 * opt-in animation, polymorphic rendering, and pseudo-state className hooks. No state, no
 * effects of its own — every render is pure.
 *
 * Resolution order each render:
 *
 *   1. **Style extraction** — `extractStyleProps` separates the ~80 curated CSS shorthand props
 *      (`display`, `flex`, `p`, `bg`, ...) from HTML attributes. The matched bag is fed through
 *      the engine's `sxToStyle` so alias expansion and token resolution share one code path.
 *   2. **`sx` resolution** — the optional `sx` prop is resolved the same way, layered _under_
 *      the curated style props (so a later explicit `bg="primary.50"` wins over an `sx` entry).
 *   3. **`centered` shortcut** — when set, defaults `display: flex; align-items: center;
 *      justify-content: center;`. Inserted at the **bottom** of the style stack, so any
 *      explicit consumer override naturally wins.
 *   4. **`decorative` shortcut** — when set, defaults `position: absolute; inset: 0;
 *      pointer-events: none;` and adds `aria-hidden="true"`. Same low-priority slot as
 *      `centered`, so explicit overrides win.
 *   5. **`gradient` shortcut** — resolves to a `background-image` string (theme-aware
 *      radial gradient by default; accepts a config object or raw CSS). Layered just
 *      below `sx` so explicit `backgroundImage` consumer values still win.
 *   6. **`style` overlay** — the consumer's React `style` prop layers on top (highest priority).
 *   7. **Recipe classes** — `useThemedClasses(divRecipe, ...)` handles `hideOn` / `displayOn`
 *      plus the theme override pipeline + consumer `className`.
 *   8. **Pseudo classes** — `buildPseudoClassName` walks the pseudo prop map and emits Tailwind
 *      prefixed classes (`hover:...`, `focus-visible:...`, `active:...`, ...), then merges.
 *   9. **Render** — `asChild` → `<Slot>`; `animation` → `motion.create(Element)` (skipped when
 *      `useReducedMotion()` is true); otherwise `createElement(Element, ...)`.
 *
 * @example
 *   <Div display="flex" p={4} bg="primary.50" radius="md">Hello</Div>
 *   <Div hideOn="md">Mobile only</Div>
 *   <Div centered h="100vh"><Spinner /></Div>
 *   <Div decorative gradient />
 *   <Div decorative gradient={{ position: 'top', size: '60%' }} />
 *   <Div actLike="button" onClick={open}>Click me</Div>
 *   <Div onHover="bg-primary-100 scale-[1.02]">Hover me</Div>
 *   <Div animation="fadeIn">Enters fading</Div>
 */
export const Div = forwardRef<HTMLElement, DivProps>(function Div(props, ref) {
  const {
    as,
    actLike,
    asChild = false,
    animation,
    centered = false,
    decorative = false,
    gradient,
    hideOn,
    displayOn,
    onHover,
    onFocusVisible,
    onActive,
    onDisabled,
    onChecked,
    onGroupHover,
    onDataState,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  if (process.env.NODE_ENV !== 'production') {
    if (as && actLike) {
      warn(
        false,
        'Div: `as` and `actLike` are mutually exclusive — `actLike` wins. Drop one.',
        'DIV_AS_ACTLIKE',
      );
    }
    if ((as || actLike) && asChild) {
      warn(
        false,
        'Div: `as`/`actLike` and `asChild` cannot be combined — `asChild` wins. Drop one.',
        'DIV_AS_ASCHILD',
      );
    }
    if (animation && asChild) {
      warn(
        false,
        'Div: `animation` is ignored when `asChild` is set — the child element renders unwrapped. Move the animation to the child or drop `asChild`.',
        'DIV_ANIM_ASCHILD',
      );
    }
  }

  // Hooks MUST run unconditionally (rules of hooks). All branching happens AFTER these calls.
  const reduced = useReducedMotion();
  const { className: themedCls } = useThemedClasses({
    recipe: divRecipe,
    componentName: 'Div',
    props: { hideOn, displayOn, className, sx: undefined, style: undefined },
  });

  const { styleObj, restProps } = extractStyleProps(rest as Record<string, unknown>);
  const sxStyle = sx ? sxToStyle(sx) : undefined;
  const gradientImage = buildGradientBackground(gradient);

  // `decorative` adds the absolute-fill overlay defaults at the lowest priority so
  // any explicit position / inset / pointerEvents from sx, style props, or the
  // consumer `style` prop wins naturally.
  const decorativeStyle: CSSProperties | undefined = decorative
    ? {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }
    : undefined;

  // Compose the inline style stack. Order (lowest → highest priority):
  //   centered defaults → decorative defaults → gradient backgroundImage → sx →
  //   curated style props → consumer style.
  // Putting low-level shortcuts FIRST means any explicit value from later layers
  // wins naturally — no extra "check before assign" logic needed.
  let finalStyle: CSSProperties | undefined;
  const hasExplicitStyle = Boolean(sxStyle || styleObj || style);
  const gradientStyle: CSSProperties | undefined = gradientImage
    ? { backgroundImage: gradientImage }
    : undefined;

  if (centered || decorativeStyle || gradientStyle || hasExplicitStyle) {
    finalStyle = {
      ...(centered
        ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
        : {}),
      ...(decorativeStyle ?? {}),
      ...(gradientStyle ?? {}),
      ...(sxStyle ?? {}),
      ...(styleObj ?? {}),
      ...(style ?? {}),
    };
  }

  const pseudoCls = buildPseudoClassName({
    onHover,
    onFocusVisible,
    onActive,
    onDisabled,
    onChecked,
    onGroupHover,
    onDataState,
  } as PseudoPropMap);

  const finalCls = pseudoCls ? cn(themedCls, pseudoCls) : themedCls;

  // `decorative` defaults `aria-hidden="true"` so screen readers skip the purely
  // visual overlay. Spread order means an explicit consumer `aria-hidden` always
  // wins — the default is only applied when the consumer didn't pass one.
  const mergedRest: Record<string, unknown> = decorative
    ? { 'aria-hidden': true, ...(restProps as Record<string, unknown>) }
    : (restProps as Record<string, unknown>);

  // `asChild` short-circuits everything else: <Slot> merges Div's props onto the child element.
  // Animation is intentionally dropped here (warned above) — wrapping <Slot> with `motion.create`
  // would double-clone the child and break ref forwarding.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={finalCls || undefined}
        style={finalStyle}
        {...mergedRest}
      >
        {children}
      </Slot>
    );
  }

  // `actLike` wins over `as` when both are set (warned above).
  const ResolvedElement: ElementType = actLike ?? as ?? 'div';

  if (animation && !reduced) {
    const MotionElement = motion.create(ResolvedElement);
    const variant = motionPresets[animation];
    return createElement(
      MotionElement as ElementType,
      {
        ref,
        className: finalCls || undefined,
        style: finalStyle,
        initial: variant.initial,
        animate: variant.animate,
        exit: variant.exit,
        ...mergedRest,
      },
      children,
    );
  }

  return createElement(
    ResolvedElement,
    {
      ref,
      className: finalCls || undefined,
      style: finalStyle,
      ...mergedRest,
    },
    children,
  );
}, 'Div');