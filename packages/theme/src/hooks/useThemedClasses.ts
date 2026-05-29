'use client';

import { cn, sxToStyle, type Sx, type VariantConfig, type VariantFn } from '@apx-ui/engine';
import { useMemo, type CSSProperties } from 'react';
import { useTheme } from './useTheme';

export interface UseThemedClassesOptions<P extends Record<string, unknown>> {
  /** The component's own variant recipe (built with `cv` in the engine). */
  recipe: VariantFn<VariantConfig>;
  /** Props received by the component (variant axes + className + sx + style). */
  props: P & {
    className?: string | undefined;
    sx?: Sx | undefined;
    style?: CSSProperties | undefined;
  };
  /**
   * The "slot" name. Components with multiple slots (e.g. Button has `root` and `icon`) call this
   * hook per slot. The theme's `components.<Name>.styleOverrides.<slot>` is appended.
   */
  slot?: string;
  /**
   * Canonical component name used to look up `theme.components.<Name>` overrides. Pass `'Button'`,
   * `'Input'`, etc. When omitted the theme override step is skipped (useful for ad-hoc components).
   */
  componentName?: string;
}

export interface UseThemedClassesReturn {
  /** Final composed class string. */
  className: string;
  /** Inline style (from `sx` resolution merged with consumer `style`). */
  style: CSSProperties | undefined;
}

/**
 * The **single** override resolver used by every DS component. Resolves the precedence chain
 * (engine recipe → theme defaultProps → consumer variant props → theme styleOverrides →
 * consumer className → sx → style) exactly once, in one place, so no component re-implements
 * override logic.
 *
 * Precedence for **variant-axis props** (`variant`, `size`, `color`, `shape`, …):
 *
 *   1. recipe's own `defaultVariants` (compiled into `cv()`)
 *   2. `theme.components.<Name>.defaultProps[axis]` — set by the consumer's theme
 *   3. consumer-supplied prop (only if not `undefined`)
 *
 * `undefined` is treated as "not provided" — the theme default wins. Defined falsy values
 * (`false`, `0`, `''`) are still treated as provided and override the theme. This matches the
 * React / Radix / RHF convention for "optional missing" props and is what every DS component's
 * README documents.
 *
 * Precedence for **classes / styles** (low → high, last wins via `tailwind-merge`):
 *
 *   1. `recipe(props)` — engine class string composed from base + variants + compound
 *   2. `theme.components.<Name>.styleOverrides.<slot>` — theme-level class string
 *   3. `props.className` — consumer override
 *   4. `props.sx` → inline style (handled by React; always wins over classes for matching keys)
 *   5. `props.style` — naturally wins via CSS specificity
 *
 * The recipe reads `props.className` itself (engine `cv` already does this). This hook layers
 * the theme overrides between the recipe and the consumer className.
 */
export function useThemedClasses<P extends Record<string, unknown>>({
  recipe,
  props,
  slot = 'root',
  componentName,
}: UseThemedClassesOptions<P>): UseThemedClassesReturn {
  const { theme } = useTheme();

  return useMemo(() => {
    const componentOverride = componentName ? theme.components?.[componentName] : undefined;
    const themeOverride = componentOverride?.styleOverrides?.[slot];
    const themeDefaultProps = componentOverride?.defaultProps;

    const {
      className: userClassName,
      sx,
      style,
      ...recipeProps
    } = props as Record<string, unknown> & {
      className?: string;
      sx?: Sx;
      style?: CSSProperties;
    };

    // Layer `theme.components.<Name>.defaultProps` under the consumer props. Per the
    // documented contract, a consumer prop only wins when it is **defined** — `undefined`
    // means "not provided" and falls through to the theme default. Defined falsy values
    // (`false`, `0`, `''`) are honored. This is implemented in two passes (assign theme
    // first, then overlay only the defined consumer entries) rather than a naive spread,
    // because `{ ...themeDefaultProps, ...recipeProps }` would let an explicit
    // `variant: undefined` from the consumer clobber the theme default — that's the bug
    // this whole task exists to fix.
    let mergedRecipeProps: Record<string, unknown> = recipeProps;
    if (themeDefaultProps) {
      const merged: Record<string, unknown> = { ...themeDefaultProps };
      for (const key of Object.keys(recipeProps)) {
        const value = recipeProps[key];
        if (value !== undefined) merged[key] = value;
      }
      mergedRecipeProps = merged;
    }

    const recipeClass = recipe(mergedRecipeProps as Parameters<typeof recipe>[0]);
    const finalClass = cn(recipeClass, themeOverride, userClassName);

    const sxStyle = sx ? sxToStyle(sx) : undefined;
    const mergedStyle = sxStyle || style ? { ...(sxStyle ?? {}), ...(style ?? {}) } : undefined;

    return { className: finalClass, style: mergedStyle };
  }, [recipe, props, slot, theme, componentName]);
}
