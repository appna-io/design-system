import { Div, Stat } from '@apx-ui/ds';

import { metrics } from '../data';

/**
 * Outcome band. `Stat` in compound form so the number carries `font-display` — the shorthand
 * `value` prop renders through the recipe's own type scale, and the page's headline face should
 * own its biggest numbers.
 *
 * Values are pre-formatted strings in `data.ts` (`'6.5 hrs'`, `'<30s'`), which keeps `Stat`'s
 * `Intl` number path out of the way — it would have no idea what to do with the unit or the
 * comparator.
 */
const VALUE_CLASS = 'font-display text-3xl sm:text-4xl';

export function Metrics() {
  return (
    <Div as="section" className="border-y border-border-subtle bg-bg-subtle">
      <Div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {metrics.map((metric) => (
          <Stat key={metric.label} variant="minimal" size="lg">
            <Stat.Value className={VALUE_CLASS}>{metric.value}</Stat.Value>
            <Stat.Label>{metric.label}</Stat.Label>
            <Stat.Caption>{metric.caption}</Stat.Caption>
          </Stat>
        ))}
      </Div>
    </Div>
  );
}
