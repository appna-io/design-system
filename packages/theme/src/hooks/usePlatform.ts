'use client';

import type { ThemePlatform } from '@apx-ui/tokens';
import type { PlatformSetting } from '../context';
import { useTheme } from './useTheme';

export interface UsePlatformReturn {
  /**
   * The platform actually applied right now (`'apple'` or `'other'`). If `platform === 'auto'`
   * this is the result of browser detection; otherwise it equals `platform`.
   */
  platform: ThemePlatform;
  /** The user's *setting* (may be `'auto'`). Pass back to `setPlatform()` round-trip. */
  setting: PlatformSetting;
  /** Pin the platform, or pass `'auto'` to re-enable detection. */
  setPlatform: (platform: PlatformSetting) => void;
  /** Convenience boolean — equivalent to `platform === 'apple'`. */
  isApple: boolean;
}

/**
 * Access the resolved platform (`'apple' | 'other'`) and toggle the platform setting.
 *
 * The platform powers the adaptive `default` theme variant: on Safari / Apple-WebKit it activates
 * a Cupertino-leaning overlay; everywhere else the canonical apx-base look wins.
 *
 * @example
 *   const { platform, isApple } = usePlatform();
 *   // tweak some non-token behavior — e.g. swap an icon
 *   return isApple ? <AppleSpinner /> : <DefaultSpinner />;
 *
 * @example
 *   // Force Cupertino in screenshot tests
 *   const { setPlatform } = usePlatform();
 *   setPlatform('apple');
 */
export function usePlatform(): UsePlatformReturn {
  const { resolvedPlatform, platform, setPlatform } = useTheme();
  return {
    platform: resolvedPlatform,
    setting: platform,
    setPlatform,
    isApple: resolvedPlatform === 'apple',
  };
}
