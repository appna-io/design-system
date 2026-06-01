import type { ComponentType, SVGProps } from 'react';

import { DS_ICON_NAMES, type DSIconName } from './DS_ICON_CATALOG';

/**
 * The opaque registry shape consumers obtain via `createIconRegistry`. We deliberately don't
 * expose the underlying `Map` — wrapping it lets us swap the backing storage later (e.g. for a
 * lazy-loading variant) without an API change.
 */
export interface IconRegistry {
  resolve: (name: string) => IconComponent | undefined;
  has: (name: string) => boolean;
  /** All registered names. Stable order = registration order. Useful for dev tooling. */
  keys: () => string[];
}

/** What an icon "component" actually is — a function that returns an SVG element. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Source map accepted by `createIconRegistry`. Keys are arbitrary strings; in strict mode the
 * key set must cover every `DSIconName` (TypeScript enforces this at the call site).
 */
export type IconRegistrySource = Record<string, IconComponent>;

export interface CreateIconRegistryOptions {
  /**
   * When `true`, the function expects the source map to cover every `DSIconName`. The TypeScript
   * overload below picks up this option and types the source parameter as a complete record so
   * a missing name is a compile error.
   */
  strict?: boolean;
}

/**
 * Build an immutable icon registry from a name → ComponentType map. The returned registry has
 * stable identity for the lifetime of the call — re-creating it on every render would defeat
 * the `<IconProvider>` context-stability contract. Consumers should `useMemo` if they're
 * constructing the registry inside a component, but typical usage is once at the module level.
 *
 * Strict overload: when `{ strict: true }` is passed, the source map MUST cover every
 * `DSIconName`. The DS components will then render correctly without per-call fallbacks.
 */
export function createIconRegistry(
  source: Record<DSIconName, IconComponent>,
  options: { strict: true },
): IconRegistry;
export function createIconRegistry(
  source: IconRegistrySource,
  options?: CreateIconRegistryOptions,
): IconRegistry;
export function createIconRegistry(
  source: IconRegistrySource,
  options: CreateIconRegistryOptions = {},
): IconRegistry {
  // Runtime strict check is best-effort — the compile-time signature is the authoritative
  // contract, but a JS consumer (no TS) can still hit `strict: true` and we surface a clear
  // dev-time warning rather than failing silently.
  if (options.strict && process.env.NODE_ENV !== 'production') {
    for (const name of DS_ICON_NAMES) {
      if (!(name in source)) {
        console.warn(
          `[apx-ds] createIconRegistry({ strict: true }) is missing DS icon "${name}".`,
        );
      }
    }
  }

  // Freeze the source-key snapshot at construction so callers mutating the input object don't
  // accidentally mutate the registry. The component values are referenced; we don't deep-clone.
  const entries = Object.entries(source) as Array<[string, IconComponent]>;
  const map = new Map<string, IconComponent>(entries);

  return {
    resolve(name) {
      return map.get(name);
    },
    has(name) {
      return map.has(name);
    },
    keys() {
      return Array.from(map.keys());
    },
  };
}

/**
 * The empty registry — returned by the context default so apps without an `<IconProvider>`
 * don't crash on `name=` lookups (they just render the fallback + a dev warning).
 */
export const EMPTY_ICON_REGISTRY: IconRegistry = {
  resolve: () => undefined,
  has: () => false,
  keys: () => [],
};