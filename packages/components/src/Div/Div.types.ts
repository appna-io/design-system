import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { MotionPresetName, Sx } from '@apx-ui/engine';

/**
 * Breakpoint keys recognized by `<Div hideOn />` / `<Div displayOn />`. Matches the engine's
 * responsive scale minus `base` (which would be a no-op for both directions).
 */
export type DivBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Animation preset name. Reuses the engine's `motionPresets` table, restricted to the
 * mount-style presets (those that ship a full `initial` / `animate` / `exit` triple).
 * `pressScale` is intentionally excluded — it's a `whileTap`-only interaction preset that
 * belongs on the trigger element (`<Button>` etc.), not on a generic layout primitive.
 */
export type DivAnimation = Exclude<MotionPresetName, 'pressScale'>;

/**
 * Pseudo-state hooks exposed as `<Div onHover="..." />` props. Each accepts a className string;
 * every token gets Tailwind-prefixed via the engine's `prefixClasses` helper (e.g. `onHover`
 * with `"bg-primary-100 scale-105"` emits `hover:bg-primary-100 hover:scale-105`).
 *
 * `onFocus` is intentionally omitted — see `pseudoProps.ts` for why.
 */
export type DivPseudoState =
  | 'onHover'
  | 'onFocusVisible'
  | 'onActive'
  | 'onDisabled'
  | 'onChecked'
  | 'onGroupHover'
  | 'onDataState';

/**
 * Curated CSS style shorthand props. Each maps 1:1 onto its `CSSProperties` counterpart (or a
 * `sxToStyle` alias such as `m` / `p` / `bg` / `radius` / `shadow` / `z`). Values flow through
 * `sxToStyle` so token strings (`bg="primary.main"`, `radius="md"`) resolve to CSS vars.
 *
 * Scalars only in v1 — responsive shape (`{ base, sm, md }`) is **not** supported on these
 * props (it would require per-element scoped CSS injection). Compose with `hideOn` / `displayOn`
 * or fall back to `className` for responsive layout.
 */
export interface DivStyleProps {
  // aliases (sxToStyle expands them)
  m?: CSSProperties['margin'] | undefined;
  mt?: CSSProperties['marginTop'] | undefined;
  mr?: CSSProperties['marginRight'] | undefined;
  mb?: CSSProperties['marginBottom'] | undefined;
  ml?: CSSProperties['marginLeft'] | undefined;
  mx?: CSSProperties['marginInline'] | undefined;
  my?: CSSProperties['marginBlock'] | undefined;
  p?: CSSProperties['padding'] | undefined;
  pt?: CSSProperties['paddingTop'] | undefined;
  pr?: CSSProperties['paddingRight'] | undefined;
  pb?: CSSProperties['paddingBottom'] | undefined;
  pl?: CSSProperties['paddingLeft'] | undefined;
  px?: CSSProperties['paddingInline'] | undefined;
  py?: CSSProperties['paddingBlock'] | undefined;
  w?: CSSProperties['width'] | undefined;
  h?: CSSProperties['height'] | undefined;
  radius?: CSSProperties['borderRadius'] | string | undefined;
  shadow?: CSSProperties['boxShadow'] | string | undefined;
  z?: CSSProperties['zIndex'] | undefined;
  bg?: CSSProperties['backgroundColor'] | string | undefined;
  fg?: CSSProperties['color'] | string | undefined;

  // layout
  display?: CSSProperties['display'] | undefined;
  position?: CSSProperties['position'] | undefined;
  top?: CSSProperties['top'] | undefined;
  right?: CSSProperties['right'] | undefined;
  bottom?: CSSProperties['bottom'] | undefined;
  left?: CSSProperties['left'] | undefined;
  inset?: CSSProperties['inset'] | undefined;
  zIndex?: CSSProperties['zIndex'] | undefined;
  overflow?: CSSProperties['overflow'] | undefined;
  overflowX?: CSSProperties['overflowX'] | undefined;
  overflowY?: CSSProperties['overflowY'] | undefined;
  visibility?: CSSProperties['visibility'] | undefined;

  // flex / grid
  flex?: CSSProperties['flex'] | undefined;
  flexDirection?: CSSProperties['flexDirection'] | undefined;
  flexWrap?: CSSProperties['flexWrap'] | undefined;
  flexBasis?: CSSProperties['flexBasis'] | undefined;
  flexGrow?: CSSProperties['flexGrow'] | undefined;
  flexShrink?: CSSProperties['flexShrink'] | undefined;
  alignItems?: CSSProperties['alignItems'] | undefined;
  alignContent?: CSSProperties['alignContent'] | undefined;
  alignSelf?: CSSProperties['alignSelf'] | undefined;
  justifyContent?: CSSProperties['justifyContent'] | undefined;
  justifyItems?: CSSProperties['justifyItems'] | undefined;
  justifySelf?: CSSProperties['justifySelf'] | undefined;
  gap?: CSSProperties['gap'] | undefined;
  rowGap?: CSSProperties['rowGap'] | undefined;
  columnGap?: CSSProperties['columnGap'] | undefined;
  order?: CSSProperties['order'] | undefined;
  gridTemplateColumns?: CSSProperties['gridTemplateColumns'] | undefined;
  gridTemplateRows?: CSSProperties['gridTemplateRows'] | undefined;
  gridArea?: CSSProperties['gridArea'] | undefined;
  gridColumn?: CSSProperties['gridColumn'] | undefined;
  gridRow?: CSSProperties['gridRow'] | undefined;
  gridAutoFlow?: CSSProperties['gridAutoFlow'] | undefined;
  gridAutoColumns?: CSSProperties['gridAutoColumns'] | undefined;
  gridAutoRows?: CSSProperties['gridAutoRows'] | undefined;
  placeItems?: CSSProperties['placeItems'] | undefined;
  placeContent?: CSSProperties['placeContent'] | undefined;
  placeSelf?: CSSProperties['placeSelf'] | undefined;

  // sizing
  width?: CSSProperties['width'] | undefined;
  height?: CSSProperties['height'] | undefined;
  minWidth?: CSSProperties['minWidth'] | undefined;
  maxWidth?: CSSProperties['maxWidth'] | undefined;
  minHeight?: CSSProperties['minHeight'] | undefined;
  maxHeight?: CSSProperties['maxHeight'] | undefined;
  boxSizing?: CSSProperties['boxSizing'] | undefined;
  aspectRatio?: CSSProperties['aspectRatio'] | undefined;

  // spacing (canonical names — aliases above expand into these)
  margin?: CSSProperties['margin'] | undefined;
  padding?: CSSProperties['padding'] | undefined;
  marginTop?: CSSProperties['marginTop'] | undefined;
  marginRight?: CSSProperties['marginRight'] | undefined;
  marginBottom?: CSSProperties['marginBottom'] | undefined;
  marginLeft?: CSSProperties['marginLeft'] | undefined;
  marginInline?: CSSProperties['marginInline'] | undefined;
  marginBlock?: CSSProperties['marginBlock'] | undefined;
  paddingTop?: CSSProperties['paddingTop'] | undefined;
  paddingRight?: CSSProperties['paddingRight'] | undefined;
  paddingBottom?: CSSProperties['paddingBottom'] | undefined;
  paddingLeft?: CSSProperties['paddingLeft'] | undefined;
  paddingInline?: CSSProperties['paddingInline'] | undefined;
  paddingBlock?: CSSProperties['paddingBlock'] | undefined;

  // color / background
  color?: CSSProperties['color'] | string | undefined;
  backgroundColor?: CSSProperties['backgroundColor'] | string | undefined;
  background?: CSSProperties['background'] | undefined;
  backgroundImage?: CSSProperties['backgroundImage'] | undefined;

  // border
  border?: CSSProperties['border'] | undefined;
  borderRadius?: CSSProperties['borderRadius'] | string | undefined;
  borderWidth?: CSSProperties['borderWidth'] | undefined;
  borderStyle?: CSSProperties['borderStyle'] | undefined;
  borderColor?: CSSProperties['borderColor'] | string | undefined;
  borderTop?: CSSProperties['borderTop'] | undefined;
  borderRight?: CSSProperties['borderRight'] | undefined;
  borderBottom?: CSSProperties['borderBottom'] | undefined;
  borderLeft?: CSSProperties['borderLeft'] | undefined;

  // typography
  fontSize?: CSSProperties['fontSize'] | undefined;
  fontWeight?: CSSProperties['fontWeight'] | undefined;
  fontFamily?: CSSProperties['fontFamily'] | undefined;
  lineHeight?: CSSProperties['lineHeight'] | undefined;
  letterSpacing?: CSSProperties['letterSpacing'] | undefined;
  textAlign?: CSSProperties['textAlign'] | undefined;
  textTransform?: CSSProperties['textTransform'] | undefined;
  textDecoration?: CSSProperties['textDecoration'] | undefined;
  whiteSpace?: CSSProperties['whiteSpace'] | undefined;
  textOverflow?: CSSProperties['textOverflow'] | undefined;
  wordBreak?: CSSProperties['wordBreak'] | undefined;

  // effects
  boxShadow?: CSSProperties['boxShadow'] | string | undefined;
  opacity?: CSSProperties['opacity'] | undefined;
  cursor?: CSSProperties['cursor'] | undefined;
  transition?: CSSProperties['transition'] | undefined;
  transform?: CSSProperties['transform'] | undefined;
  pointerEvents?: CSSProperties['pointerEvents'] | undefined;
  userSelect?: CSSProperties['userSelect'] | undefined;
  filter?: CSSProperties['filter'] | undefined;
  backdropFilter?: CSSProperties['backdropFilter'] | undefined;
}

/**
 * Pseudo-state className hooks. Each prop accepts a Tailwind className string; tokens are
 * automatically prefixed with the corresponding state variant (`hover:`, `focus-visible:`, ...).
 */
export interface DivPseudoProps {
  /** Tailwind classes applied on `:hover`. e.g. `"bg-primary-100 scale-[1.02]"`. */
  onHover?: string | undefined;
  /** Tailwind classes applied on `:focus-visible` (keyboard focus). e.g. `"ring-2 ring-primary-500"`. */
  onFocusVisible?: string | undefined;
  /** Tailwind classes applied on `:active` (pressed). e.g. `"scale-[0.98]"`. */
  onActive?: string | undefined;
  /** Tailwind classes applied on `:disabled`. e.g. `"opacity-50 cursor-not-allowed"`. */
  onDisabled?: string | undefined;
  /** Tailwind classes applied when `aria-checked="true"`. */
  onChecked?: string | undefined;
  /** Tailwind classes applied when a parent `.group` is hovered. */
  onGroupHover?: string | undefined;
  /** Tailwind classes applied when `data-state="open"` is present. */
  onDataState?: string | undefined;
}

/**
 * `<Div />`-specific props (separate from the style / pseudo / HTML buckets so the prop surface
 * stays inspectable).
 */
export interface DivOwnProps {
  /** Render element. Defaults to `'div'`. */
  as?: ElementType | undefined;
  /**
   * Alias of `as`. Provided because the requested API uses `actLike="button"` reading. When both
   * `as` and `actLike` are set, `actLike` wins and a dev warning fires.
   */
  actLike?: ElementType | undefined;
  /**
   * Radix-style polymorphism — merges Div's props onto the single child element. Mutually
   * exclusive with `as` / `actLike`; `asChild` wins on conflict (dev warning fires).
   */
  asChild?: boolean | undefined;
  /**
   * Animation preset (`fadeIn`, `scaleIn`, `slideInFromBottom`, `slideInFromTop`, `pressScale`).
   * When set, the element renders through `motion.create(...)` with the matching variant.
   * `useReducedMotion()` short-circuits the wrapper so reduced-motion users get a plain element.
   * Skipped when `asChild` is true.
   */
  animation?: DivAnimation | undefined;
  /**
   * Shortcut for `display: flex; align-items: center; justify-content: center;`. Explicit
   * style props win — if any of the three keys is also supplied, the consumer value is kept.
   */
  centered?: boolean | undefined;
  /** Hide the element at the named breakpoint and above (Tailwind "from upward" semantics). */
  hideOn?: DivBreakpoint | undefined;
  /** Start hidden, reveal the element at the named breakpoint and above. */
  displayOn?: DivBreakpoint | undefined;
  /** Theme-aware inline style (resolves palette / spacing / radius tokens). */
  sx?: Sx | undefined;
  /** Inline style override. Wins over `sx`, curated style props, and the `centered` shortcut. */
  style?: CSSProperties | undefined;
  /** Standard className. Appended after the recipe + pseudo classes via `tailwind-merge`. */
  className?: string | undefined;
  /** Children to render inside the element (or the single child when `asChild` is true). */
  children?: ReactNode | undefined;
  /** Ref to the rendered element. Type depends on `as` / `actLike` / `asChild`. */
  ref?: Ref<HTMLElement>;
}

/**
 * Full prop surface accepted by `<Div />`. Composes the four buckets:
 *  1. `DivOwnProps` — `as`, `actLike`, `asChild`, `animation`, `centered`, `hideOn`, `displayOn`, `sx`, `style`, `className`.
 *  2. `DivStyleProps` — the curated CSS shorthand surface (~80 keys).
 *  3. `DivPseudoProps` — pseudo-state className hooks.
 *  4. `HTMLAttributes<HTMLElement>` — global HTML attributes + DOM event handlers (`id`, `role`, `aria-*`, `data-*`, `onClick`, ...).
 *
 * Element-specific attributes (`href`, `type`, `src`, ...) used with `as` / `actLike` are listed
 * explicitly below so the common polymorphic cases (`actLike="a" href="…"`,
 * `actLike="button" type="submit"`) type-check without a `Record<string, unknown>` cast.
 */
export interface DivProps
  extends DivOwnProps,
    DivStyleProps,
    DivPseudoProps,
    Omit<
      HTMLAttributes<HTMLElement>,
      keyof DivOwnProps | keyof DivStyleProps | keyof DivPseudoProps
    > {
  /** Anchor `href` — narrow when using `as="a"` / `actLike="a"`. */
  href?: string | undefined;
  /** Button `type` — narrow when using `as="button"` / `actLike="button"`. */
  type?: string | undefined;
  /** Anchor `target`. */
  target?: string | undefined;
  /** Anchor `rel`. */
  rel?: string | undefined;
  /** Anchor `download`. */
  download?: string | boolean | undefined;
  /** Media `src`. */
  src?: string | undefined;
  /** Media `alt`. */
  alt?: string | undefined;
  /** Form field `name`. */
  name?: string | undefined;
  /** Form field `value`. */
  value?: string | number | readonly string[] | undefined;
  /** Label `htmlFor`. */
  htmlFor?: string | undefined;
  /** Form control `disabled`. */
  disabled?: boolean | undefined;
  /** Form control `checked`. */
  checked?: boolean | undefined;
}
