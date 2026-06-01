'use client';

/**
 * Phase 23 (Select) made this hook a two-consumer abstraction; the implementation was promoted
 * to `_shared/useListKeyboard.ts` per the DS DRY rule. Menu now re-exports the canonical hook
 * with menu-flavored type aliases so existing call sites (`MenuContent`, `MenuSubContent`) don't
 * need a behavior change — just a names-only re-bind.
 */
import { useListKeyboard, __INTERNAL as listInternal } from '../_shared/useListKeyboard';

import type { MenuKeyHandler, UseMenuKeyboardOptions } from './Menu.types';

export function useMenuKeyboard(opts: UseMenuKeyboardOptions): MenuKeyHandler {
  return useListKeyboard(opts);
}

export const __INTERNAL = listInternal;