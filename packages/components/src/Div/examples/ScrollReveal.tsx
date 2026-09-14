'use client';

import { useState } from 'react';
import { Div, Typography } from '@apx-ui/ds';

const CARDS = [
  { id: 'a', label: 'Ships on scroll', color: 'primary' },
  { id: 'b', label: 'Cascades in order', color: 'secondary' },
  { id: 'c', label: 'Respects reduced motion', color: 'success' },
  { id: 'd', label: 'Tokens, not magic numbers', color: 'info' },
] as const;

/**
 * `animateOnView` + `stagger` together — the combination every marketing section wants.
 *
 * The scroll container is deliberately short and `overflow-y-auto`: the docs page itself is a
 * long scroll, so a reveal anchored to the *page* viewport would have already fired by the time
 * you read this. A nested scroller lets you re-trigger it on demand instead.
 */
export default function ScrollReveal() {
  const [tick, setTick] = useState(0);

  return (
    <Div display="flex" flexDirection="column" gap={12}>
      <button
        type="button"
        onClick={() => setTick((t) => t + 1)}
        className="self-start rounded-md bg-primary px-3 py-1.5 text-sm text-primary-contrast"
      >
        Replay
      </button>

      <Div
        key={tick}
        className="h-64 overflow-y-auto rounded-lg border border-border p-4"
      >
        <Div className="flex h-56 items-center justify-center">
          <Typography variant="bodySmall" color="fg.subtle">
            ↓ scroll down
          </Typography>
        </Div>

        <Div stagger={0.09} staggerDelay={0.05} animateOnView={{ amount: 0.2 }}>
          <Div display="flex" flexDirection="column" gap={8}>
            {CARDS.map((card) => (
              <Div
                key={card.id}
                animation="riseIn"
                animationDuration="slow"
                animationEase="emphasized"
                p={4}
                radius="md"
                bg={`${card.color}.subtle`}
                fg={`${card.color}.main`}
              >
                {card.label}
              </Div>
            ))}
          </Div>
        </Div>

        <Div className="h-24" />
      </Div>
    </Div>
  );
}
