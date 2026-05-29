'use client';

import { createContext } from 'react';
import type { ComponentType, SVGProps } from 'react';

import { EMPTY_ICON_REGISTRY, type IconRegistry } from './IconRegistry';
import type { IconColor } from './resolveIconColor';
import type { IconSize } from './resolveIconSize';

/**
 * Internal context shape — the registry plus optional provider-level defaults that cascade
 * into every `<Icon>` in the subtree (size / color / variant). Defaults are intentionally
 * conservative: an app without an `<IconProvider>` still gets the same per-prop defaults the
 * Icon component itself ships.
 */
export interface IconRegistryContextValue {
  registry: IconRegistry;
  defaultSize: IconSize | undefined;
  defaultColor: IconColor | undefined;
  defaultVariant: string | undefined;
  fallback: ComponentType<SVGProps<SVGSVGElement>> | null;
  onMissing: ((name: string) => void) | undefined;
}

export const IconRegistryContext = createContext<IconRegistryContextValue>({
  registry: EMPTY_ICON_REGISTRY,
  defaultSize: undefined,
  defaultColor: undefined,
  defaultVariant: undefined,
  fallback: null,
  onMissing: undefined,
});

IconRegistryContext.displayName = 'IconRegistryContext';
