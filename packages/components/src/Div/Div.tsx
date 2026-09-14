'use client';

import {
  Slot,
  cn,
  defaultViewport,
  forwardRef,
  motionPresets,
  resolveTransition,
  sxToStyle,
  useReducedMotion,
  warn,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { motion } from 'motion/react';
import { createElement, type CSSProperties, type ElementType } from 'react';

import { divRecipe } from './Div.recipe';
import {
  DIV_VARIANT_LABELS,
  DivStaggerProvider,
  useDivOrchestrated,
} from './DivStaggerContext';

/**
 * Motion components, memoised per element type.
 *
 * `motion.create()` MUST NOT be called during render: it mints a brand-new component type on
 * every pass, so React tears the subtree down and remounts it each time. The mount animation
 * then restarts from `initial` forever — for `slideInFromBottom` that is `opacity: 0`, i.e. the
 * content renders permanently invisible — and the remount churn costs a full subtree each
 * render. Caching by element type keeps one stable identity per tag for the app's lifetime.
 */
const motionElementCache = new Map<ElementType, ElementType>();

/**
 * Hoisted so the provider's `value` is referentially stable. A fresh `{ orchestrating: true }`
 * object each render would re-notify every consumer in the subtree on every parent render.
 */
const STAGGER_ON = { orchestrating: true } as const;

function motionElementFor(element: ElementType): ElementType {
  const cached = motionElementCache.get(element);
  if (cached) return cached;
  const created = motion.create(element as Parameters<typeof motion.create>[0]) as ElementType;
  motionElementCache.set(element, created);
  return created;
}
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
 *      the curated style props (so a later explicit `bg="primary.subtle"` wins over an `sx` entry).
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
 *   <Div display="flex" p={4} bg="primary.subtle" radius="md">Hello</Div>
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
    animateOnView,
    animationDelay,
    animationDuration,
    animationEase,
    stagger,
    staggerDelay,
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
    if (stagger != null && asChild) {
      warn(
        false,
        'Div: `stagger` is ignored when `asChild` is set — no motion element is rendered, so there is nothing to orchestrate the children from. Drop `asChild`.',
        'DIV_STAGGER_ASCHILD',
      );
    }
    if (animateOnView && !animation && stagger == null) {
      warn(
        false,
        'Div: `animateOnView` needs something to trigger — add an `animation` preset, or a `stagger` to orchestrate animated children.',
        'DIV_ONVIEW_NO_ANIM',
      );
    }
    if (staggerDelay != null && stagger == null) {
      warn(
        false,
        'Div: `staggerDelay` requires `stagger` — it delays the first staggered child, so without `stagger` there is no sequence to delay. Use `animationDelay` to delay this element itself.',
        'DIV_STAGGERDELAY_NO_STAGGER',
      );
    }
  }

  // Hooks MUST run unconditionally (rules of hooks). All branching happens AFTER these calls.
  const reduced = useReducedMotion();
  // Read BEFORE this element decides its own role: a stagger group that is itself inside another
  // stagger group must participate in the outer cascade while orchestrating its own children.
  const orchestratedByAncestor = useDivOrchestrated();
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

  const orchestrates = typeof stagger === 'number';

  // Reduced motion falls through to the plain element below — which is the whole point: a
  // viewport-triggered reveal that never receives its trigger would leave the content pinned at
  // `opacity: 0` forever, so reduced-motion users must get fully-visible markup, not a paused
  // animation.
  if ((animation || orchestrates) && !reduced) {
    const MotionElement = motionElementFor(ResolvedElement);
    const preset = animation ? motionPresets[animation] : undefined;

    const transition = resolveTransition({
      delay: animationDelay,
      duration: animationDuration,
      ease: animationEase,
      staggerChildren: orchestrates ? stagger : undefined,
      delayChildren: orchestrates ? staggerDelay : undefined,
    });

    const viewport = animateOnView
      ? animateOnView === true
        ? defaultViewport
        : { ...defaultViewport, ...animateOnView }
      : undefined;

    // Three mutually exclusive roles, and the distinction is load-bearing:
    //
    //   participant  — an ancestor is cascading us. We declare `variants` and MUST NOT declare
    //                  `initial`/`animate`: an explicit `animate` outranks the inherited variant
    //                  label, which silently severs this element from the parent's timeline and
    //                  makes `staggerChildren` look like it does nothing.
    //   orchestrator — we drive the cascade: same variant map, plus we supply the label ourselves.
    //   standalone   — the original behaviour, animating straight from the preset.
    const usesVariants = orchestratedByAncestor || orchestrates;

    let motionProps: Record<string, unknown>;

    if (usesVariants) {
      const variants = {
        [DIV_VARIANT_LABELS.hidden]: preset?.initial ?? {},
        [DIV_VARIANT_LABELS.visible]: {
          ...(preset?.animate ?? {}),
          ...(transition ? { transition } : {}),
        },
        [DIV_VARIANT_LABELS.exit]: preset?.exit ?? {},
      };

      motionProps = { variants };

      // A participant stays silent on `initial`/`animate` so the ancestor's label reaches it.
      // An orchestrator that is NOT itself a participant has to start the sequence.
      if (!orchestratedByAncestor) {
        motionProps['initial'] = DIV_VARIANT_LABELS.hidden;
        motionProps['exit'] = DIV_VARIANT_LABELS.exit;
        if (viewport) {
          motionProps['whileInView'] = DIV_VARIANT_LABELS.visible;
          motionProps['viewport'] = viewport;
        } else {
          motionProps['animate'] = DIV_VARIANT_LABELS.visible;
        }
      }
    } else {
      const variant = preset!;
      motionProps = {
        initial: variant.initial,
        exit: variant.exit,
        ...(transition ? { transition } : {}),
      };
      if (viewport) {
        motionProps['whileInView'] = variant.animate;
        motionProps['viewport'] = viewport;
      } else {
        motionProps['animate'] = variant.animate;
      }
    }

    const element = createElement(
      MotionElement as ElementType,
      {
        ref,
        className: finalCls || undefined,
        style: finalStyle,
        ...motionProps,
        ...mergedRest,
      },
      children,
    );

    // Only an orchestrator opens the provider. A participant deliberately leaves the existing
    // value in place so the cascade keeps reaching further descendants through ordinary
    // non-animated wrapper markup.
    return orchestrates ? (
      <DivStaggerProvider value={STAGGER_ON}>{element}</DivStaggerProvider>
    ) : (
      element
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