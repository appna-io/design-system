import type { ComponentType, CSSProperties, ReactNode, SVGAttributes, SVGProps } from 'react';

import type { DSIconName } from './DS_ICON_CATALOG';
import type { IconComponent, IconRegistry } from './IconRegistry';
import type { IconColor } from './resolveIconColor';
import type { IconSize } from './resolveIconSize';

export type IconRotate = 0 | 90 | 180 | 270;
export type IconFlip = 'none' | 'horizontal' | 'vertical' | 'both';
export type IconVariant = 'default' | 'filled' | 'duotone';

/**
 * Extra DOM/SVG attributes Icon forwards to the rendered element (event handlers, data-*,
 * aria-*, etc.). We Omit the props Icon owns or reinterprets (`children`, `color`, `ref`) to
 * avoid type collisions with `IconProps`.
 */
export type IconDOMAttributes = Omit<
  SVGAttributes<SVGSVGElement>,
  'children' | 'color' | 'ref' | 'className' | 'style' | 'role' | 'aria-label' | 'aria-hidden' | 'focusable'
>;

/**
 * Props for `<Icon>`. The three render-source axes (`children`, `as`, `name`) are mutually
 * exclusive in terms of what gets rendered, but TypeScript intentionally allows multiple to be
 * passed — runtime precedence (children > as > name) handles graceful fallback when a name
 * lookup misses. This is the same trade-off `<Button asChild>` / `<Slot>` chose.
 */
export interface IconProps extends IconDOMAttributes {
  /**
   * Inline custom SVG (or any React node). Highest precedence — wins over `as` and `name`.
   * Useful for one-off illustrations.
   */
  children?: ReactNode;

  /**
   * A component to render (e.g. `import { Mail } from 'lucide-react'` → `as={Mail}`). The DS
   * passes resolved a11y / className / style as props; the underlying component is expected
   * to accept standard `SVGProps<SVGSVGElement>`.
   *
   * Second-highest precedence: `as` wins over `name`, loses to `children`.
   */
  as?: IconComponent | ComponentType<SVGProps<SVGSVGElement>>;

  /**
   * Registry lookup. Resolves the component via the active `<IconProvider>`. Accepts any
   * string for app-specific names; the typed `DSIconName` union covers the shipped DS catalog
   * so consumers using a DS-internal name get autocomplete.
   */
  name?: DSIconName | (string & {});

  /**
   * Size token (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`), numeric px, or any CSS length string.
   * Tokens drive recipe classes; numeric / arbitrary strings apply via inline width/height/font.
   * Default: `'md'` (1rem ≈ 16px, also sets fontSize so child SVGs scale via `[h|w]-full`).
   */
  size?: IconSize;

  /**
   * Color token (DS palette name), `'current'` to inherit `currentColor`, `'inherit'` for
   * `color: inherit`, or any CSS color string (`'#f00'`, `'var(--my-c)'`, …). Default:
   * `'current'`.
   */
  color?: IconColor;

  /**
   * Accessible label. When non-empty (and `decorative` is not explicitly `true`), the icon
   * renders with `role="img"` + `aria-label={label}`. Use this when the icon stands alone (no
   * visible label) and conveys meaning the AT user must hear.
   */
  label?: string;

  /**
   * Explicit decorative override. When `true`, forces `aria-hidden="true"` even if a `label`
   * was supplied. Useful when the surrounding text already covers the meaning and the icon is
   * purely visual ornament. Default: `true` when no `label`, `false` when `label` is set.
   */
  decorative?: boolean;

  /** Visual rotation (CSS transform). 0 / 90 / 180 / 270 are the supported quarter-turns. */
  rotate?: IconRotate;

  /** CSS scale flip. `'horizontal'` mirrors X; `'vertical'` mirrors Y; `'both'` mirrors both. */
  flip?: IconFlip;

  /**
   * Apply the spinner ring animation. Respects `prefers-reduced-motion: reduce` (motion-safe
   * variant prevents the animation from running for users with the OS-level setting on).
   */
  spin?: boolean;

  /**
   * Hint to libraries that distinguish solid / outline / duotone (heroicons does, lucide
   * doesn't). Default: `'default'`. Consumers route this through their `<IconProvider>` map
   * when relevant; the DS doesn't introspect.
   */
  variant?: IconVariant;

  /**
   * When `true`, the resolved element is rendered via `<Slot>` so the child element (a single
   * React element) receives the merged className + style + ARIA props. Used for power cases
   * like wrapping the icon in a `<Tooltip>` while preserving Icon's a11y wiring.
   */
  asChild?: boolean;

  className?: string;
  style?: CSSProperties;
  /**
   * Forwarded to the rendered element. Typed loosely so consumers can use either a callback
   * ref or an object ref against the underlying SVG / wrapper.
   */
  ref?: React.Ref<SVGSVGElement | HTMLElement>;
}

/**
 * Props for `<IconProvider>`. The registry plus optional defaults that cascade into every
 * `<Icon>` rendered inside (overridable per-Icon).
 */
export interface IconProviderProps {
  value: IconRegistry;
  /** Provider-level default size (overridable per-Icon). */
  defaultSize?: IconSize;
  /** Provider-level default color (overridable per-Icon). */
  defaultColor?: IconColor;
  /** Provider-level default variant (overridable per-Icon). */
  defaultVariant?: IconVariant;
  /**
   * Component rendered when a `name` lookup misses. Defaults to `null` — the Icon renders an
   * empty placeholder of the same dimensions so layouts don't jump.
   */
  fallback?: ComponentType<SVGProps<SVGSVGElement>> | null;
  /**
   * Dev hook invoked when a `name` lookup misses. Defaults to a `console.warn` in non-prod
   * builds; pass an explicit function to forward to your error-tracking layer.
   */
  onMissing?: (name: string) => void;
  children: ReactNode;
}
