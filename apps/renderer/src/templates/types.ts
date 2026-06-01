import type { ComponentType } from 'react';

/**
 * Persona / industry classification used to group templates on the gallery page.
 * Add new tags freely — the gallery groups templates by `category` alphabetically.
 */
export type TemplateCategory =
  | 'Marketing'
  | 'Application'
  | 'Dashboard'
  | 'E-commerce'
  | 'Portfolio'
  | 'Other';

/**
 * One inspectable region of a template. The orchestrator wraps each section in
 * an `<Inspectable id="...">` block; when the user enables Inspector mode, the
 * overlay walks up the DOM to the nearest `[data-inspect-id]` and shows the
 * `label` as a hover badge. Clicking opens the source modal pre-loaded with the
 * file at `file` (read on the server at request time and pre-highlighted via Shiki).
 */
export interface TemplateInspectable {
  /** Stable id used as the DOM attribute value and source-map key. */
  id: string;
  /** Human label shown in the hover badge + modal title. */
  label: string;
  /**
   * Path to the section's source file, relative to the template folder
   * (e.g. `'sections/Hero.tsx'`). Read at request time on the server.
   */
  file: string;
}

export interface TemplateMeta {
  /** URL-safe identifier. Becomes `/templates/<slug>`. Must be unique across the registry. */
  slug: string;
  /** Display title shown on the gallery card and preview chrome. */
  name: string;
  /** One-line pitch shown on the gallery card. */
  description: string;
  /** Grouping label on the gallery page. */
  category: TemplateCategory;
  /** Free-form keywords; surfaced in the gallery card as small chips. */
  tags?: readonly string[];
  /**
   * Optional theme variant the preview should switch to on entry. Lets a template
   * author opt into a specific identity ("origami", "katana", ...) without locking
   * the user out of the floating variant picker.
   */
  preferredVariant?: 'default' | 'tetsu' | 'origami' | 'katana';
  /**
   * Optional mode hint for the preview ("light" | "dark"). The viewer toolbar can
   * still flip it. Leave undefined to keep the user's current preference.
   */
  preferredMode?: 'light' | 'dark';
  /** Author / studio credit shown subtly on the gallery card. */
  credit?: string;
  /**
   * Sections the inspector lets users pop open. Ids here must match the `id` prop
   * on the `<Inspectable>` wrappers inside the template's `Component`. The server
   * resolves `file` against `apps/renderer/src/templates/<slug>/`, so the template
   * folder name must equal the `slug`.
   */
  inspectable?: readonly TemplateInspectable[];
}

/**
 * A registry entry. The `Component` is the entire website body — the viewer renders
 * it directly into the document with no extra chrome wrapping it.
 */
export interface TemplateEntry {
  meta: TemplateMeta;
  Component: ComponentType;
}