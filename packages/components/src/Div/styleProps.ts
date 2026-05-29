import { sxToStyle, type Sx } from '@apx-ui/engine';
import type { CSSProperties } from 'react';

/**
 * Full set of style shorthand prop keys recognized by `<Div />`. Anything in this set is extracted
 * from the props bag, fed through `sxToStyle` for token resolution + alias expansion, and emitted
 * as a single `CSSProperties` object. Anything NOT in this set flows untouched to the rendered
 * element so HTML attributes (`id`, `role`, `aria-*`, `data-*`, event handlers) keep working.
 *
 * The set intentionally mirrors MUI Box's surface and includes both the short aliases the engine's
 * `sxToStyle` recognizes (`m`, `p`, `bg`, `radius`, `shadow`, `z`, `w`, `h`, `fg`) and the long
 * canonical CSS names (`margin`, `padding`, `backgroundColor`, ...). Consumers can pick whichever
 * reads better at the call site.
 */
export const STYLE_PROP_KEYS: ReadonlySet<string> = new Set<string>([
  // aliases delegated to sxToStyle
  'm',
  'mt',
  'mr',
  'mb',
  'ml',
  'mx',
  'my',
  'p',
  'pt',
  'pr',
  'pb',
  'pl',
  'px',
  'py',
  'w',
  'h',
  'radius',
  'shadow',
  'z',
  'bg',
  'fg',
  // layout
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'zIndex',
  'overflow',
  'overflowX',
  'overflowY',
  'visibility',
  // flex / grid
  'flex',
  'flexDirection',
  'flexWrap',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'alignItems',
  'alignContent',
  'alignSelf',
  'justifyContent',
  'justifyItems',
  'justifySelf',
  'gap',
  'rowGap',
  'columnGap',
  'order',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridArea',
  'gridColumn',
  'gridRow',
  'gridAutoFlow',
  'gridAutoColumns',
  'gridAutoRows',
  'placeItems',
  'placeContent',
  'placeSelf',
  // sizing
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'boxSizing',
  'aspectRatio',
  // spacing
  'margin',
  'padding',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginInline',
  'marginBlock',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInline',
  'paddingBlock',
  // color / background
  'color',
  'backgroundColor',
  'background',
  'backgroundImage',
  // border
  'border',
  'borderRadius',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  // typography
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textTransform',
  'textDecoration',
  'whiteSpace',
  'textOverflow',
  'wordBreak',
  // effects
  'boxShadow',
  'opacity',
  'cursor',
  'transition',
  'transform',
  'pointerEvents',
  'userSelect',
  'filter',
  'backdropFilter',
]);

export interface ExtractStylePropsResult {
  /** Resolved CSSProperties (post-`sxToStyle`). `undefined` when no style props were supplied. */
  styleObj: CSSProperties | undefined;
  /** Every prop that wasn't a style shorthand — flows to the rendered element untouched. */
  restProps: Record<string, unknown>;
}

/**
 * Split a props bag into `(styleObj, restProps)` using `STYLE_PROP_KEYS` as the discriminator.
 *
 * The matched keys are gathered into an `Sx`-shaped object and fed through the engine's
 * `sxToStyle` resolver so alias expansion (`m` → `margin`, `bg` → `backgroundColor`, ...) and
 * token resolution (`bg="primary.main"` → `var(--sds-palette-primary-main)`) happen in one
 * pass — the same code path the standalone `sx` prop uses. Non-matched keys flow to `restProps`
 * untouched so HTML attributes and event handlers reach the rendered element.
 *
 * `undefined` style values are dropped (treated as "not provided") — this lets consumers spread
 * partial style objects without producing empty inline-style entries.
 */
export function extractStyleProps(props: Record<string, unknown>): ExtractStylePropsResult {
  let sxBag: Sx | undefined;
  const rest: Record<string, unknown> = {};

  for (const key of Object.keys(props)) {
    const value = props[key];
    if (STYLE_PROP_KEYS.has(key)) {
      if (value === undefined) continue;
      if (!sxBag) sxBag = {} as Sx;
      (sxBag as Record<string, unknown>)[key] = value as string | number;
    } else {
      rest[key] = value;
    }
  }

  const styleObj = sxBag ? sxToStyle(sxBag) : undefined;
  return { styleObj, restProps: rest };
}
