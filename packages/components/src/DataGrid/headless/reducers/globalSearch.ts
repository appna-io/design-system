export type GlobalSearchAction = { type: 'set'; value: string };

export const initialGlobalSearchState = '';

/** Global search reducer — a one-line passthrough kept as a slice for symmetry. */
export function globalSearchReducer(_state: string, action: GlobalSearchAction): string {
  switch (action.type) {
    case 'set':
      return action.value;
  }
}