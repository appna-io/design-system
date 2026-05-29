/**
 * Public surface for the `<Div />` styling primitive — the DS's "Box" equivalent.
 *
 * `Div` is a single export (no compound subparts) backed by a small set of helpers:
 *   - `extractStyleProps` / `STYLE_PROP_KEYS` — split CSS shorthand from HTML props.
 *   - `buildPseudoClassName` / `PSEUDO_PREFIX` — Tailwind-prefix pseudo-state strings.
 *
 * Helpers are exported alongside the component because they're useful for power users building
 * their own polymorphic wrappers on top of `Div` (the same pattern Stack uses for `gapClasses`).
 */
export { Div } from './Div';
export { divRecipe } from './Div.recipe';
export { extractStyleProps, STYLE_PROP_KEYS } from './styleProps';
export { buildPseudoClassName, PSEUDO_PREFIX } from './pseudoProps';

export type {
  DivAnimation,
  DivBreakpoint,
  DivOwnProps,
  DivProps,
  DivPseudoProps,
  DivPseudoState,
  DivStyleProps,
} from './Div.types';
export type { PseudoPropMap, PseudoPropName } from './pseudoProps';
export type { ExtractStylePropsResult } from './styleProps';
