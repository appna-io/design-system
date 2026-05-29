import type { DataGridDensity } from '../../DataGrid.types';

export type DensityAction = { type: 'set'; density: DataGridDensity };

export const initialDensityState: DataGridDensity = 'standard';

export function densityReducer(_state: DataGridDensity, action: DensityAction): DataGridDensity {
  switch (action.type) {
    case 'set':
      return action.density;
  }
}
