import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'stat',
  displayName: 'Stat',
  description:
    'Dashboard metric tile with label, value, optional trend delta, and locale-aware numeric formatting via `Intl.NumberFormat`. Compound subcomponents (`Stat.Icon` / `Stat.Label` / `Stat.Value` / `Stat.Delta` / `Stat.Caption`) for full composition control. Ships with `<StatGroup>` for row/column layouts with auto-oriented dividers.',
  category: 'Data Display',
  tags: ['stat', 'metric', 'kpi', 'dashboard', 'analytics', 'number'],
};