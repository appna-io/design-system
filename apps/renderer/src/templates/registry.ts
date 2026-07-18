import type { TemplateEntry } from './types';
import { emberRoasteryTemplate } from './ember-roastery';

/**
 * The full set of preview templates. Order here drives gallery + sidebar ordering
 * (within each category we additionally sort alphabetically — see `getTemplates`).
 *
 * Adding a new template:
 *   1. Create a folder under `templates/<slug>/`
 *   2. Export a `TemplateEntry` with a `meta` + `Component`
 *   3. Add it to the list below
 *
 * That's it — no routes, no manual gallery wiring, no MDX.
 */
const TEMPLATES: readonly TemplateEntry[] = [emberRoasteryTemplate];

export function getTemplates(): readonly TemplateEntry[] {
  return TEMPLATES;
}

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
  return TEMPLATES.find((t) => t.meta.slug === slug);
}

export function getTemplateSlugs(): readonly string[] {
  return TEMPLATES.map((t) => t.meta.slug);
}