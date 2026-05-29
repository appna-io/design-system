import { createContext, useContext } from 'react';

import type { StatContextValue } from './Stat.types';

/**
 * Shares `size` + `colorize` from `<Stat>` to compound subparts so each subcomponent can
 * pick the matching font scale without prop-drilling. Defaults match `Stat` defaults so
 * `Stat.Label` etc. remain useful standalone (rare, but supported).
 */
export const StatContext = createContext<StatContextValue>({
  size: 'md',
  colorize: 'auto',
});

export const useStatContext = (): StatContextValue => useContext(StatContext);
