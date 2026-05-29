// utilities
export { cn, type ClassValue } from './cn';
export { cv, VARIANT_META_KEYS } from './cv';
export { Slot, Slottable, type SlotProps } from './slot';
export { forwardRef } from './forwardRef';
export { token, tokenName, tokens, TOKEN_PREFIX } from './token';
export { breakpointPrefix, prefixClasses, resolveResponsive } from './responsive';
export { sxToStyle } from './sx';

// color
export {
  deriveColorRole,
  parseHex,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  mixRgb,
  shiftLightness,
} from './color';

// polymorphism
export type { PolymorphicComponent, PolymorphicProps, PolymorphicRef } from './polymorphic';

// context
export {
  DirectionContext,
  DirectionProvider,
  useDirection,
  type Direction,
  type DirectionProviderProps,
} from './direction';

// i18n
export {
  I18nContext,
  I18nProvider,
  buildFormatters,
  createMessageBundle,
  inferDirection,
  interpolate,
  mergeMessages,
  resolveMessage,
  useFormatters,
  useI18n,
  useLocale,
  useTranslator,
  MissingI18nKeyError,
  type I18nContextValue,
  type I18nFormatters,
  type I18nMessages,
  type I18nProviderProps,
  type InterpolationParams,
  type LocaleBundles,
  type LocaleTag,
  type MessageBundle,
  type TranslationParams,
} from './i18n';

// keyboard — roving tabindex (Phase 58 RFC #1)
export {
  DEFAULT_ROVING_ITEM_SELECTOR,
  findNextEnabledIndex,
  indexOfRovingId,
  isElementRtl,
  resolveRovingNextIndex,
  useRovingTabindexDom,
  useRovingTabindexRegistry,
  type ActivationMode,
  type Orientation,
  type RovingItem,
  type RovingTabindexBaseOptions,
  type UseRovingTabindexDomOptions,
  type UseRovingTabindexDomReturn,
  type UseRovingTabindexRegistryOptions,
  type UseRovingTabindexRegistryReturn,
} from './keyboard';

// hooks
export {
  useControllableState,
  type UseControllableStateOptions,
} from './hooks/useControllableState';
export { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
export { useId } from './hooks/useId';
export { usePrevious } from './hooks/usePrevious';
export { useMediaQuery, type UseMediaQueryOptions } from './hooks/useMediaQuery';

// motion
export {
  motionPresets,
  transitionTokens,
  useReducedMotion,
  type MotionPresetName,
  type SimpleVariant,
  type TransitionTokens,
} from './motion';

// registry
export {
  getComponentMeta,
  getRegisteredComponents,
  registerComponent,
  type ComponentMeta,
} from './registry';

// dev
export { warn, __resetWarnCache } from './dev/warn';

// overlay primitives — Phase 17 (Core)
export {
  usePosition,
  type Placement,
  type UsePositionOptions,
  type UsePositionReturn,
} from './positioning';
export { Portal, type PortalProps } from './Portal';
export {
  FocusTrap,
  useFocusTrap,
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  isFocusable,
  type FocusTrapProps,
  type UseFocusTrapOptions,
} from './focus-trap';
export { useEscapeStack, type UseEscapeStackOptions } from './escape-stack';
export { useOutsideClick, type UseOutsideClickOptions } from './useOutsideClick';
export { useScrollLock } from './useScrollLock';
export { mergeRefs } from './mergeRefs';

// types
export { isResponsiveObject, RESPONSIVE_BREAKPOINTS } from './types/responsive';
export type {
  BorderColors,
  BreakpointKey,
  BreakpointScale,
  ColorRole,
  ColorRoleName,
  CompoundVariant,
  ComponentThemeOverride,
  ForegroundColors,
  MotionShape,
  PaletteShape,
  RadiusScale,
  ResponsiveValue,
  ShadowScale,
  SpacingScale,
  SurfaceColors,
  Sx,
  ThemeShape,
  TypographyShape,
  VariantConfig,
  VariantFn,
  VariantProps,
  VariantValues,
  ZIndexScale,
} from './types';
