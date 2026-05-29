/**
 * Tiny programmatic registry of components, used by tooling that wants to introspect the DS at
 * runtime (e.g. "list all components", code generators, docs sidecar). The renderer doesn't rely
 * on this — it discovers components from the file system — so the registry stays optional.
 */

export interface ComponentMeta {
  /** Lowercased, kebab-cased identifier (e.g. `'button'`). Must be unique. */
  name: string;
  /** Human-readable display name (e.g. `'Button'`). */
  displayName: string;
  /** One-line description shown in docs/listings. */
  description?: string;
  /** Grouping for nav UIs (e.g. `'Inputs'`, `'Layout'`). */
  category?: string;
  /** Free-form tags for search/filtering. */
  tags?: readonly string[];
}

const registry = new Map<string, ComponentMeta>();

/**
 * Register a component. Calling twice with the same `name` replaces the prior entry — handy for
 * HMR but watch out for typos.
 */
export function registerComponent(meta: ComponentMeta): void {
  registry.set(meta.name, meta);
}

/** Get all registered components, sorted by `name`. */
export function getRegisteredComponents(): ComponentMeta[] {
  return Array.from(registry.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Look up one component by name. */
export function getComponentMeta(name: string): ComponentMeta | undefined {
  return registry.get(name);
}

/** Test-only helper. Not part of the public surface in normal consumers. */
export function __clearRegistry(): void {
  registry.clear();
}
