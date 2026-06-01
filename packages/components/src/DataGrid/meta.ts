import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'data-grid',
  displayName: 'DataGrid',
  description:
    'The canonical data-display primitive of the DS — semantic `<table role="grid">` with the full ARIA Grid pattern, headless `useDataGrid()` state machine (sort, filter, paginate, select, columns, density, expansion, editing), pixel-clean default chrome (4 variants × 7 colors × 3 densities), RTL-first layout, and a first-class i18n contract. PR 5 adds column pinning + drag-to-resize + double-click cell editing + expandable detail rows + sticky aggregations footer + canonical loading / empty / error states. PR 6 layers row virtualization on top via `<DataGrid.VirtualBody>` (opt-in `virtualization="rows"`, peer dep on `@tanstack/react-virtual`) — 50k rows scroll smoothly while the `<table>` markup, ARIA roles, and selection state all survive intact. PR 7 ships Hebrew + Arabic translation bundles, a `column.responsive.hideBelow` media-query bridge, and the `storage="local" | "session" | StorageAdapter` persistence layer — selection + page index excluded so a refresh never re-applies a stale selection. PR 8 (polish + the heavy README) closes out the surface.',
  category: 'Data Display',
  tags: ['data-grid', 'datagrid', 'table', 'data-table', 'grid', 'sort', 'aria-grid'],
};