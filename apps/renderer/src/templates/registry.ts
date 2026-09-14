import type { TemplateEntry } from './types';
import { cadenceOpsTemplate } from './cadence-ops';
import { fadeAndCoTemplate } from './fade-and-co';
import { halyardTemplate } from './halyard';
import { fernwoodTemplate } from './fernwood';
import { lyliCoffeeTemplate } from './lyli-coffee';
import { relayAtelierTemplate } from './relay-atelier';
import { northboundTemplate } from './northbound';
import { vantageStudioTemplate } from './vantage-studio';

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
const TEMPLATES: readonly TemplateEntry[] = [
  lyliCoffeeTemplate,
  fadeAndCoTemplate,
  cadenceOpsTemplate,
  vantageStudioTemplate,
  northboundTemplate,
  halyardTemplate,
  fernwoodTemplate,
  relayAtelierTemplate,
];

export function getTemplates(): readonly TemplateEntry[] {
  return TEMPLATES;
}

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
  return TEMPLATES.find((t) => t.meta.slug === slug);
}

export function getTemplateSlugs(): readonly string[] {
  return TEMPLATES.map((t) => t.meta.slug);
}
