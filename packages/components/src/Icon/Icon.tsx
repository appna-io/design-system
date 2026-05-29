'use client';

import { Slot, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  cloneElement,
  isValidElement,
  useContext,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type SVGProps,
} from 'react';

import { iconRecipe } from './Icon.recipe';
import type { IconProps } from './Icon.types';
import { IconRegistryContext } from './IconRegistry.context';
import { resolveIconA11y } from './resolveIconA11y';
import { resolveIconColor } from './resolveIconColor';
import { resolveIconSize } from './resolveIconSize';

/**
 * `<Icon />` — the DS icon primitive.
 *
 * Three render-source axes in precedence order:
 *
 *  1. **`children`** — inline SVG / illustration. Wins over everything else.
 *  2. **`as`** — ComponentType (e.g. `as={Mail}` from lucide-react). Wins over `name`.
 *  3. **`name`** — string lookup against the registry from `<IconProvider>`. Misses fall
 *     through to the provider's `fallback` (or an empty placeholder).
 *
 * Why three modes? Different teams have different ergonomics:
 *
 *  - `as` works zero-config for one-off imports in a single file (`<Icon as={X} />`).
 *  - `name` is the 80% case: register the app's icon set once, then `<Icon name="…" />`
 *    everywhere — no per-file imports, central swap point if the library changes.
 *  - `children` is the escape hatch for custom SVGs that don't fit either mode.
 *
 * Library-agnostic by design — the Icon source imports zero icon libraries. Consumers wire
 * lucide / heroicons / radix-icons / iconify themselves via `createIconRegistry`.
 */
function IconImpl(
  props: IconProps,
  forwardedRef: ForwardedRef<SVGSVGElement | HTMLElement>,
): ReactElement | null {
  const {
    children,
    as: AsComponent,
    name,
    size,
    color,
    label,
    decorative,
    rotate = 0,
    flip = 'none',
    spin = false,
    variant: _variant,
    asChild = false,
    className,
    style,
    ...rest
  } = props;

  // ── Pull provider defaults ──────────────────────────────────────────────────────────────
  const ctx = useContext(IconRegistryContext);
  const effectiveSize = size ?? ctx.defaultSize;
  const effectiveColor = color ?? ctx.defaultColor;

  // ── Resolve size + color into recipe tokens or inline overrides ─────────────────────────
  const sizeResolved = resolveIconSize(effectiveSize);
  const colorResolved = resolveIconColor(effectiveColor);

  // ── A11y resolution ─────────────────────────────────────────────────────────────────────
  const a11y = resolveIconA11y({ ...(label !== undefined ? { label } : {}), ...(decorative !== undefined ? { decorative } : {}) });

  // ── Classes via theme ───────────────────────────────────────────────────────────────────
  const { className: cls, style: themedStyle } = useThemedClasses({
    recipe: iconRecipe,
    componentName: 'Icon',
    slot: 'root',
    props: {
      // Only pass token values; numeric / arbitrary values are handled via inline style.
      ...(sizeResolved.token ? { size: sizeResolved.token } : {}),
      ...(colorResolved.token ? { color: colorResolved.token } : {}),
      rotate: String(rotate) as '0' | '90' | '180' | '270',
      flip,
      spin,
      className,
    },
  });

  // ── Merge inline style overrides ────────────────────────────────────────────────────────
  const mergedStyle: CSSProperties | undefined = (() => {
    const out: CSSProperties = { ...(themedStyle as CSSProperties | undefined) };
    if (sizeResolved.style) Object.assign(out, sizeResolved.style);
    if (colorResolved.style) Object.assign(out, colorResolved.style);
    if (style) Object.assign(out, style);
    return Object.keys(out).length > 0 ? out : undefined;
  })();

  // ── Build the props that get forwarded to whatever element renders ──────────────────────
  // `focusable={false}` is the IE/legacy safety belt — modern browsers don't add SVGs to the
  // tab order, but older WebViews still do. Cheap to keep.
  const rendered: Record<string, unknown> = {
    ...rest,
    className: cls,
    style: mergedStyle,
    role: a11y.role,
    'aria-label': a11y['aria-label'],
    'aria-hidden': a11y['aria-hidden'],
    focusable: 'false',
  };

  // ── asChild path: <Slot> takes the merged props and applies them to the single child ────
  if (asChild) {
    if (!isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[apx-ds] <Icon asChild> expected a single React element as children. Got:',
          children,
        );
      }
      return null;
    }
    return (
      <Slot ref={forwardedRef as never} {...(rendered as Record<string, unknown>)}>
        {children}
      </Slot>
    );
  }

  // ── Precedence 1: children — inline SVG / arbitrary node ─────────────────────────────────
  if (children !== undefined && children !== null && children !== false) {
    // When children is a single element, clone-and-merge so the inner element receives all the
    // ARIA + className wiring without an extra wrapper div. When children is something else
    // (text, fragment, multiple nodes), fall back to a span wrapper.
    const onlyChild = Children.count(children) === 1 ? Children.only(children) : null;
    if (onlyChild && isValidElement(onlyChild)) {
      const childProps = (onlyChild.props ?? {}) as Record<string, unknown>;
      return cloneElement(onlyChild as ReactElement<Record<string, unknown>>, {
        ...rendered,
        className: combineClassNames(rendered['className'] as string | undefined, childProps['className']),
        style: { ...((childProps['style'] as CSSProperties | undefined) ?? {}), ...mergedStyle },
        ref: forwardedRef as never,
      });
    }
    // Mixed children: wrap in a span so the recipe still applies. SVG semantics are unclear here.
    return (
      <span
        ref={forwardedRef as unknown as React.Ref<HTMLSpanElement> as never}
        {...(rendered as unknown as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }

  // ── Precedence 2: `as` — explicit component ──────────────────────────────────────────────
  if (AsComponent) {
    const Component = AsComponent as React.ComponentType<SVGProps<SVGSVGElement> & { ref?: React.Ref<SVGSVGElement> }>;
    return (
      <Component
        {...(rendered as SVGProps<SVGSVGElement>)}
        ref={forwardedRef as React.Ref<SVGSVGElement>}
      />
    );
  }

  // ── Precedence 3: `name` — registry lookup ───────────────────────────────────────────────
  if (name) {
    const Resolved = ctx.registry.resolve(name);
    if (Resolved) {
      return (
        <Resolved
          {...(rendered as SVGProps<SVGSVGElement>)}
          ref={forwardedRef as React.Ref<SVGSVGElement>}
        />
      );
    }
    // Missing name — fire dev callback (once per name to avoid log floods) then render
    // fallback or empty placeholder so layouts don't jump.
    fireMissingOnce(name, ctx.onMissing);
    if (ctx.fallback) {
      const Fallback = ctx.fallback;
      return (
        <Fallback
          {...(rendered as SVGProps<SVGSVGElement>)}
          ref={forwardedRef as React.Ref<SVGSVGElement>}
        />
      );
    }
    return (
      <span
        ref={forwardedRef as unknown as React.Ref<HTMLSpanElement> as never}
        {...(rendered as unknown as React.HTMLAttributes<HTMLSpanElement>)}
        data-icon-missing={name}
      />
    );
  }

  // ── No source provided — render nothing (cheaper than throwing in production) ───────────
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[apx-ds] <Icon> requires one of: children, `as`, or `name`.');
  }
  return null;
}

/**
 * Module-local set of names we've already warned about. Two reasons we de-dup at this layer
 * instead of leaving it to the consumer's `onMissing`:
 *
 *  1. The default `console.warn` would spam the console (every render of a missing-named icon
 *     fires the callback otherwise).
 *  2. A consumer who *wants* every miss reported (e.g. for analytics) can override
 *     `onMissing` — our dedup only applies to the default warning path.
 */
const warnedMissing = new Set<string>();
function fireMissingOnce(name: string, onMissing: ((name: string) => void) | undefined): void {
  if (onMissing) {
    onMissing(name);
    return;
  }
  if (process.env.NODE_ENV === 'production') return;
  if (warnedMissing.has(name)) return;
  warnedMissing.add(name);
  console.warn(
    `[apx-ds] <Icon name="${name}" /> — no icon registered for "${name}". ` +
      `Register it via createIconRegistry({ "${name}": YourIcon }) and pass to <IconProvider>.`,
  );
}

/** Tiny class joiner — avoids pulling clsx for two strings. */
function combineClassNames(a: string | undefined, b: unknown): string | undefined {
  if (!a) return typeof b === 'string' ? b : undefined;
  if (typeof b !== 'string' || !b) return a;
  return `${a} ${b}`;
}

export const Icon = forwardRef<SVGSVGElement | HTMLElement, IconProps>(IconImpl);
Icon.displayName = 'Icon';

/** Test-only reset for the dedup set. Not part of the public surface. */
export function __resetIconWarnCache(): void {
  warnedMissing.clear();
}
