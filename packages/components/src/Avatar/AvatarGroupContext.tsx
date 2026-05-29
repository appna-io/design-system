'use client';

import { createContext, useContext } from 'react';

import type { AvatarGroupContextValue } from './Avatar.types';

/**
 * Internal context — `<AvatarGroup>` sets propagated defaults (`size`, `shape`, `variant`) here
 * so nested `<Avatar>` instances can fall back to them without each consumer threading props by
 * hand. Sibling `<Avatar>` outside a group reads `null` and uses its own per-prop defaults.
 *
 * Not exported from the package surface — composition lives inside this folder.
 */
export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

/** Read the group-provided defaults, or `null` if the avatar is outside a group. */
export function useAvatarGroup(): AvatarGroupContextValue | null {
  return useContext(AvatarGroupContext);
}
