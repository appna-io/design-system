/**
 * The DS Icon Catalog — the stable string contract every shipped component leans on. Consumers
 * register their preferred icon-library implementations against these names once via
 * `<IconProvider value={createIconRegistry({ … })} />` and the entire component surface lights
 * up automatically.
 *
 * Frozen as a `readonly` tuple so `DSIconName` derives precisely from the literal set, giving
 * consumers TypeScript autocompletion and the strict-mode registry an exhaustiveness check at
 * compile time.
 *
 * Adding a new name is a deliberate API change — only do it when a shipped component actually
 * needs the glyph. Aliases (`back` → `chevron-left`, etc.) are intentionally NOT included; we
 * keep the name set tight to avoid an explosion of synonyms.
 */
export const DS_ICON_NAMES = [
  // Status / state
  'check',
  'check-circle',
  'minus',
  'x',
  'x-circle',
  'alert-triangle',
  'info',
  // Chevrons (directional triangle marks)
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevrons-up-down',
  // Arrows (directional with shaft)
  'arrow-up',
  'arrow-down',
  // Search / loading / form
  'search',
  'loader',
  'eye',
  'eye-off',
  // Actions
  'plus',
  'more-horizontal',
  'more-vertical',
  'copy',
  'download',
  'upload',
  // Files / containers
  'file',
  // Time / calendar
  'calendar',
  'clock',
  // Media controls
  'pause',
  'play',
  // Specialized
  'eye-dropper',
  'star',
  'star-half',
] as const;

export type DSIconName = (typeof DS_ICON_NAMES)[number];