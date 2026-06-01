'use client';

import { useState } from 'react';
import { Div } from '@apx-ui/ds';

export default function Animation() {
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

      <Div display="flex" gap={12} flexWrap="wrap">
        <Div
          key={`fade-${tick}`}
          animation="fadeIn"
          p={4}
          bg="primary.50"
          radius="md"
          fg="primary.contrast"
        >
          fadeIn
        </Div>
        <Div
          key={`scale-${tick}`}
          animation="scaleIn"
          p={4}
          bg="success.50"
          radius="md"
          fg="success.contrast"
        >
          scaleIn
        </Div>
        <Div
          key={`slide-bottom-${tick}`}
          animation="slideInFromBottom"
          p={4}
          bg="info.50"
          radius="md"
          fg="info.contrast"
        >
          slideInFromBottom
        </Div>
        <Div
          key={`slide-top-${tick}`}
          animation="slideInFromTop"
          p={4}
          bg="warning.50"
          radius="md"
          fg="warning.contrast"
        >
          slideInFromTop
        </Div>
      </Div>
    </Div>
  );
}