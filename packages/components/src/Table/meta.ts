import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'table',
  displayName: 'Table',
  description:
    'Lightweight semantic `<table>` primitive — the 80%-case row/column display. Compound subparts (`Table.Head` / `Body` / `Foot` / `Row` / `HeaderCell` / `Cell` / `Caption`) **and** a declarative `columns` + `data` form share the same DOM. Single-column sort, single + multiple row selection (auto-injected checkbox column), row actions slot, loading skeleton rows, empty + error states, sticky header, four visual axes (variant, density, striped, hoverable). Sits firmly below DataGrid in scope — no virtualization, no column resize, no multi-sort.',
  category: 'Data Display',
  tags: ['table', 'grid', 'rows', 'data', 'sort', 'selection'],
};
