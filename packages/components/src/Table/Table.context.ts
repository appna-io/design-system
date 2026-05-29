import { createContext, useContext } from 'react';

import type { TableContextValue } from './Table.types';

export const TableContext = createContext<TableContextValue>({
  density: 'md',
  bordered: true,
  striped: false,
  hoverable: true,
  stickyHeader: false,
  variant: 'default',
});

export const useTableContext = (): TableContextValue => useContext(TableContext);
