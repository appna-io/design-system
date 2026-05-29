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
 *   4. **`style` overlay** — the consumer's React `style` prop layers on top (highest priority).
 *   5. **Recipe classes** — `useThemedClasses(divRecipe, ...)` handles `hideOn` / `displayOn`
 *      plus the theme override pipeline + consumer `className`.
 *   6. **Pseudo classes** — `buildPseudoClassName` walks the pseudo prop map and emits Tailwind
 *      prefixed classes (`hover:...`, `focus-visible:...`, `active:...`, ...), then merges.
 *   7. **Render** — `asChild` → `<Slot>`; `animation` → `motion.create(Element)` (skipped when
 *      `useReducedMotion()` is true); otherwise `createElement(Element, ...)`.
 *
 * @example
 *   <Div display="flex" p={4} bg="primary.50" radius="md">Hello</Div>
 *   <Div hideOn="md">Mobile only</Div>
 *   <Div centered h="100vh"><Spinner /></Div>
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

  // Compose the inline style stack. Order (lowest → highest priority):
  //   centered defaults → sx → curated style props → consumer style.
  // Putting centered defaults FIRST means any explicit display/alignItems/justifyContent
  // from later layers wins naturally — no extra "check before assign" logic needed.
  let finalStyle: CSSProperties | undefined;
  const hasExplicitStyle = Boolean(sxStyle || styleObj || style);
  if (centered) {
    finalStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...(sxStyle ?? {}),
      ...(styleObj ?? {}),
      ...(style ?? {}),
    };
  } else if (hasExplicitStyle) {
    finalStyle = { ...(sxStyle ?? {}), ...(styleObj ?? {}), ...(style ?? {}) };
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

  // `asChild` short-circuits everything else: <Slot> merges Div's props onto the child element.
  // Animation is intentionally dropped here (warned above) — wrapping <Slot> with `motion.create`
  // would double-clone the child and break ref forwarding.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={finalCls || undefined}
        style={finalStyle}
        {...(restProps as Record<string, unknown>)}
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
        ...restProps,
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
      ...restProps,
    },
    children,
  );
}, 'Div');
