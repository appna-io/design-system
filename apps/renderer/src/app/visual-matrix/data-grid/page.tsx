'use client';

/* eslint-disable react/no-array-index-key */

/**
 * Visual snapshot matrix for `<DataGrid />`.
 *
 * Renders 4 variants × 7 colors × 3 densities × {LTR, RTL} = 168 isolated
 * DataGrid instances, each wrapped in a `[data-visual-cell="variant/color/density/dir"]`
 * container. Playwright walks every wrapper and takes one screenshot per cell.
 *
 * This is **not** a docs page — it's a snapshot harness. It sits under
 * `/visual-matrix/data-grid` so the renderer's chrome / nav doesn't render around
 * it. Each cell is fixed-size so deterministic baselines are possible across
 * machines.
 */

import {
  DataGrid,
  DirectionProvider,
  type DataGridColor,
  type DataGridColumnDef,
  type DataGridDensity,
  type DataGridVariant,
} from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  team: string;
  signups: number;
}

const ROWS: Row[] = [
  { id: 1, name: 'Maya', team: 'Platform', signups: 124 },
  { id: 2, name: 'Liam', team: 'Growth', signups: 42 },
  { id: 3, name: 'Ava', team: 'Design', signups: 218 },
];

const COLUMNS: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

const VARIANTS: ReadonlyArray<DataGridVariant> = ['solid', 'outline', 'striped', 'minimal'];
const COLORS: ReadonlyArray<DataGridColor> = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];
const DENSITIES: ReadonlyArray<DataGridDensity> = ['compact', 'standard', 'comfortable'];
const DIRECTIONS = ['ltr', 'rtl'] as const;

export default function DataGridVisualMatrix() {
  return (
    <div className="flex flex-col gap-12 bg-white p-6">
      {DIRECTIONS.map((dir) => (
        <DirectionProvider key={dir} dir={dir}>
          <section className="flex flex-col gap-8">
            <h2 className="text-fg-default text-lg font-semibold uppercase">{dir}</h2>
            {VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-col gap-6">
                <h3 className="text-fg-default text-sm font-semibold capitalize">{variant}</h3>
                {COLORS.map((color) => (
                  <div key={color} className="flex flex-col gap-4">
                    <h4 className="text-fg-muted text-xs font-semibold capitalize">{color}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {DENSITIES.map((density) => (
                        <div
                          key={density}
                          data-visual-cell={`${variant}/${color}/${density}/${dir}`}
                          style={{ width: 480 }}
                          dir={dir}
                        >
                          <DataGrid<Row>
                            data={ROWS}
                            columns={COLUMNS}
                            getRowId={(r) => r.id}
                            variant={variant}
                            color={color}
                            size={density}
                            densityToggle={false}
                            columnVisibilityToggle={false}
                            exportable={false}
                            globalSearch={false}
                            defaultPagination={{ pageIndex: 0, pageSize: 0 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </DirectionProvider>
      ))}
    </div>
  );
}