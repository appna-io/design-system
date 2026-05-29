'use client';

import { createContext, useContext } from 'react';

import type {
  MenuContextValue,
  MenuRadioGroupContextValue,
  MenuSubContextValue,
} from './Menu.types';

/**
 * Three contexts for the Menu compound:
 *
 * 1. `MenuContext` — the root open/close state, item registry, keyboard highlight signal.
 *    Every Trigger / Content / Item / Group / Separator / Sub reads from this.
 * 2. `MenuSubContext` — nested open/close state for `<Menu.Sub>`. Provided by `<Menu.Sub>` for
 *    its `SubTrigger` / `SubContent` descendants. The deepest `MenuSubContext` wins.
 * 3. `MenuRadioGroupContext` — single-pick state for `<Menu.RadioGroup>`. Consumed by
 *    `<Menu.RadioItem>`.
 *
 * Throwing helpers prevent the most common authoring bug — using a subpart outside its required
 * ancestor (`<Menu.Item>` outside `<Menu.Content>`, `<Menu.RadioItem>` outside `<Menu.RadioGroup>`,
 * etc.).
 */
export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(componentName: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Menu> ancestor.`,
    );
  }
  return ctx;
}

/** Nullable variant — for subparts that may render outside a root in compound-detection paths. */
export function useMenuContextOptional(): MenuContextValue | null {
  return useContext(MenuContext);
}

export const MenuSubContext = createContext<MenuSubContextValue | null>(null);

export function useMenuSubContextOptional(): MenuSubContextValue | null {
  return useContext(MenuSubContext);
}

export function useMenuSubContext(componentName: string): MenuSubContextValue {
  const ctx = useContext(MenuSubContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Menu.Sub> ancestor.`,
    );
  }
  return ctx;
}

export const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

export function useMenuRadioGroupContext(componentName: string): MenuRadioGroupContextValue {
  const ctx = useContext(MenuRadioGroupContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Menu.RadioGroup> ancestor.`,
    );
  }
  return ctx;
}
