export { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';
export { ThemeScript, type ThemeScriptProps } from './ThemeScript';
export { defineTheme } from './defineTheme';
export { mergeTheme, type ThemeOverride, type DeepPartial } from './mergeTheme';
export { themeToCssVars, type ThemeToCssVarsOptions } from './themeToCssVars';
export { detectPlatform, DETECT_PLATFORM_EXPR, type ThemePlatform } from './platform';

export {
  ThemeContext,
  type ThemeContextValue,
  type ModeSetting,
  type PlatformSetting,
  type ResolvedMode,
} from './context';

export {
  useTheme,
  usePalette,
  useMode,
  useVariant,
  usePlatform,
  useThemeOverrides,
  useThemeDirection,
  useThemedClasses,
  type UseModeReturn,
  type UseVariantReturn,
  type UsePlatformReturn,
  type UseThemeOverridesReturn,
  type UseThemeDirectionReturn,
  type UseThemedClassesOptions,
} from './hooks';

export { apxTailwindPreset, type ApxTailwindPreset } from './tailwind-preset';