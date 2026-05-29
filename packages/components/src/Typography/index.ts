/**
 * Public surface for the `<Typography />` / `<Text />` text primitive — a thin variant-aware
 * wrapper over `<Div />` that adds typography-token resolution and the 7 text-friendly shortcuts
 * (`weight` / `italic` / `align` / `transform` / `decoration` / `truncate` / `lineClamp`).
 *
 * The pure helpers (`resolveTypographyToken`, `typographyRecipe`, `VARIANT_TO_ELEMENT`) are
 * exported alongside the component so power users can build their own text wrappers without
 * re-deriving the token tables or variant → element mapping.
 */
export { Typography, Text } from './Typography';
export { typographyRecipe } from './Typography.recipe';
export { VARIANT_TO_ELEMENT } from './variantElement';
export {
  resolveTypographyToken,
  TYPOGRAPHY_TOKEN_TABLES,
  TYPOGRAPHY_VAR_PREFIX,
  FONT_FAMILY_VARS,
} from './typographyTokens';

export type {
  TypographyAlign,
  TypographyDecoration,
  TypographyFontFamily,
  TypographyFontSize,
  TypographyLetterSpacing,
  TypographyLineHeight,
  TypographyOwnProps,
  TypographyProps,
  TypographyTransform,
  TypographyVariant,
  TypographyWeight,
} from './Typography.types';
export type { TypographyTokenProp } from './typographyTokens';
