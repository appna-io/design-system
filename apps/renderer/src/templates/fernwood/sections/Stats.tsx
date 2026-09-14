import { Div, Stat } from '@apx-ui/ds';

import { stats } from '../content';

/**
 * Proof band. `Stat` in compound form so the number carries the display face — the shorthand
 * `value` prop renders through the recipe's own type scale, and this page's headline face should
 * own its biggest numbers.
 *
 * Values are pre-formatted strings (`'12k+'`, `'4.9'`) with the numeric twin held separately as
 * `countTo` in the content. Nothing consumes `countTo` yet — `Stat` has no count-up — but it is
 * carried so that when one lands it never has to parse `'12k+'` back into 12000.
 */
export function Stats() {
  return (
    <Div as="section" className="border-y border-border-subtle bg-bg-subtle">
      <Div
        stagger={0.09}
        animateOnView
        className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8"
      >
        {stats.map((stat) => (
          <Div key={stat.label} animation="riseIn" animationDuration="slower">
            <Stat variant="minimal" size="lg">
              <Stat.Value className="font-display text-3xl sm:text-4xl">{stat.value}</Stat.Value>
              <Stat.Label>{stat.label}</Stat.Label>
            </Stat>
          </Div>
        ))}
      </Div>
    </Div>
  );
}
