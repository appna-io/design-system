'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Select } from '../../Select';
import { useDataGridContext } from '../DataGridContext';
import type { DataGridDensity } from '../DataGrid.types';

const DENSITIES: ReadonlyArray<DataGridDensity> = ['compact', 'standard', 'comfortable'];

export interface DataGridDensitySelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  sx?: Sx;
}

/**
 * `<DataGrid.DensitySelect>` — small `<Select>` that flips
 * `state.density` between compact / standard / comfortable.
 *
 * Reads + writes through the headless layer; respects the i18n labels via
 * `t.densityCompact` / `densityStandard` / `densityComfortable`.
 */
function DataGridDensitySelectImpl(
  props: DataGridDensitySelectProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx: _sx, style, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid } = ctx;
  const t = grid.t;

  const label = (d: DataGridDensity): string =>
    d === 'compact' ? t.densityCompact : d === 'standard' ? t.densityStandard : t.densityComfortable;

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-datagrid-density-select=""
      {...rest}
    >
      <Select
        value={grid.state.density}
        onValueChange={(next) => grid.setDensity(next as DataGridDensity)}
        size="sm"
        fullWidth={false}
      >
        <Select.Trigger aria-label={t.densityLabel} />
        <Select.Content>
          {DENSITIES.map((d) => (
            <Select.Item key={d} value={d}>
              {label(d)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}

export const DataGridDensitySelect = forwardRef(
  DataGridDensitySelectImpl,
  'DataGrid.DensitySelect',
) as (
  props: DataGridDensitySelectProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
