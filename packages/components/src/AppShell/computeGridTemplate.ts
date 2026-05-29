import type { AppShellLayout, AppShellSidePosition } from './AppShell.types';

/**
 * Result of computing the CSS Grid template for an AppShell configuration. Three values are
 * applied as inline `style` on the root: `gridTemplateAreas` defines the named regions,
 * `gridTemplateColumns` defines column widths, `gridTemplateRows` defines row heights.
 *
 * Computed in a pure function so unit tests can exercise every slot combination without a
 * live DOM. The component glue just calls this and spreads the result into `style`.
 */
export interface GridTemplate {
  gridTemplateAreas: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
}

export interface ComputeGridTemplateArgs {
  layout: AppShellLayout;
  sidebarPosition: AppShellSidePosition;
  asidePosition: AppShellSidePosition;
  hasHeader: boolean;
  hasSidebar: boolean;
  hasAside: boolean;
  hasFooter: boolean;
  /** Width of the sidebar in px (already accounts for rail-collapse). 0 when not rendered. */
  sidebarWidthPx: number;
  /** Width of the aside in px. 0 when collapsed / hidden. */
  asideWidthPx: number;
  /** Height of the header in px. 0 when no header. */
  headerHeightPx: number;
}

/**
 * Build the CSS Grid template for the requested AppShell configuration. The function handles
 * eight combinations: layout (default | inset) × sidebar (present | absent) × aside (present
 * | absent), with the footer adding an optional trailing row and the header an optional
 * leading row.
 *
 * Design choice: the grid is **always 3 columns** when both sidebar and aside are present
 * (sidebar | main | aside), 2 columns when one is present, and 1 column when neither is. The
 * column ORDER depends on `sidebarPosition` + `asidePosition`:
 *
 *   - sidebar=start, aside=end → `[sidebar main aside]` (the canonical Notion / Mail shape)
 *   - sidebar=end, aside=start → `[aside main sidebar]`
 *   - sidebar=start, aside=start → `[aside sidebar main]` (rare; consumers will rarely opt in)
 *   - sidebar=end, aside=end → `[main sidebar aside]` (rare)
 *
 * Rows are similarly composable: optional header row (when `hasHeader`), the main content
 * row (always present), optional footer row (when `hasFooter`).
 *
 * Layout variant matters only when there's a header:
 *
 *   - `default` → the sidebar / aside occupy the header row too (full-height columns).
 *   - `inset`   → the header spans every column (sidebar / aside start *below* the header).
 */
export function computeGridTemplate(args: ComputeGridTemplateArgs): GridTemplate {
  const {
    layout,
    sidebarPosition,
    asidePosition,
    hasHeader,
    hasSidebar,
    hasAside,
    hasFooter,
    sidebarWidthPx,
    asideWidthPx,
    headerHeightPx,
  } = args;

  // Build the ordered column list — left-to-right token names. Each token is a grid-area
  // string the rows will reference. The 'main' column is always present (it's the children
  // slot); other columns appear only when their slots are mounted.
  const columns: Array<'sidebar' | 'main' | 'aside'> = [];
  if (hasSidebar && sidebarPosition === 'start') columns.push('sidebar');
  if (hasAside && asidePosition === 'start') columns.push('aside');
  columns.push('main');
  if (hasAside && asidePosition === 'end') columns.push('aside');
  if (hasSidebar && sidebarPosition === 'end') columns.push('sidebar');

  // Column widths in px / fr. Sidebar / aside get fixed widths from the consumer; main fills
  // the rest with `1fr`.
  const columnWidths = columns.map((token) => {
    if (token === 'sidebar') return `${sidebarWidthPx}px`;
    if (token === 'aside') return `${asideWidthPx}px`;
    return '1fr';
  });

  // Build rows. Each row is an array of grid-area names with one entry per column.
  const rows: Array<{ areas: string[]; height: string }> = [];

  if (hasHeader) {
    // In `inset` layout the header spans the full row; in `default` the header lives only
    // in the columns that aren't sidebar / aside (so the sidebar / aside extend above into
    // the header row visually).
    const headerRow = columns.map((token) => {
      if (layout === 'inset') return 'header';
      if (token === 'main') return 'header';
      return token; // sidebar / aside columns get their own name → full-height side panel.
    });
    rows.push({ areas: headerRow, height: `${headerHeightPx}px` });
  }

  // Main row — every column gets its own name. This is where the 'main' area always lands.
  const mainRow = columns.map((token) => token);
  rows.push({ areas: mainRow, height: '1fr' });

  if (hasFooter) {
    // Footer: in `inset`, footer spans every column (same as header). In `default`, footer
    // spans only the main column; sidebar / aside extend through the footer row.
    const footerRow = columns.map((token) => {
      if (layout === 'inset') return 'footer';
      if (token === 'main') return 'footer';
      return token;
    });
    rows.push({ areas: footerRow, height: 'auto' });
  }

  const gridTemplateAreas = rows
    .map((row) => `"${row.areas.join(' ')}"`)
    .join(' ');
  const gridTemplateColumns = columnWidths.join(' ');
  const gridTemplateRows = rows.map((row) => row.height).join(' ');

  return { gridTemplateAreas, gridTemplateColumns, gridTemplateRows };
}
