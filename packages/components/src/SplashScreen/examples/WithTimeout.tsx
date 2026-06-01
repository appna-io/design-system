import { useState } from 'react';
import { Button, Div, Slider, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="22" fill="var(--sds-palette-primary-main)" />
    <path
      d="M22 32 L30 40 L44 24"
      stroke="var(--sds-palette-primary-contrast)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The `timeout` option auto-dismisses the splash after the configured delay. `onTimeout`
 * fires once when the timer elapses; `onHide` fires on every dismiss path (timeout, click,
 * Escape, manual `splash.hide()`).
 */
export default function WithTimeout() {
  const [seconds, setSeconds] = useState(2);
  const [lastClosedVia, setLastClosedVia] = useState<string | null>(null);

  return (
    <Div display="flex" flexDirection="column" gap="4" alignItems="flex-start" style={{ maxWidth: 460 }}>
      <Typography variant="body">
        Adjust the timeout below, then launch. The splash auto-closes after the selected
        delay. You can also dismiss it early by clicking the surface or pressing Escape.
      </Typography>

      <Div display="flex" flexDirection="column" gap="2" w="100%">
        <Typography variant="caption" color="fg.muted">
          {`timeout: ${seconds.toFixed(1)} s`}
        </Typography>
        <Slider
          min={0.5}
          max={6}
          step={0.5}
          value={seconds}
          onChange={(next) => setSeconds(typeof next === 'number' ? next : seconds)}
        />
      </Div>

      <Div display="flex" gap="2" flexWrap="wrap">
        <Button
          onClick={() =>
            splash.show({
              logo: Logo,
              title: 'MyApp',
              subtitle: `Auto-closing in ${seconds.toFixed(1)} s…`,
              showSpinner: true,
              timeout: Math.round(seconds * 1000),
              closeOnClick: true,
              onTimeout: () => setLastClosedVia('timeout'),
              onHide: () => {
                // onTimeout has already set `lastClosedVia` if applicable. We only flip to
                // "manual" when onTimeout didn't fire — which the imperative facade tells us
                // by NOT calling onTimeout before this. Easier path: clear inside onTimeout
                // by default. Here we just record the most recent dismiss path.
                setLastClosedVia((prev) => (prev === 'timeout' ? 'timeout' : 'manual'));
              },
            })
          }
        >
          Launch with timeout
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            splash.show({
              logo: Logo,
              title: 'Persistent splash',
              subtitle: 'No timeout — click or press Escape to dismiss.',
              showSpinner: true,
              closeOnClick: true,
              onHide: () => setLastClosedVia('manual'),
            })
          }
        >
          Launch with no timeout
        </Button>
      </Div>

      {lastClosedVia ? (
        <Typography variant="caption" color="fg.muted">
          Last close: <strong>{lastClosedVia}</strong>
        </Typography>
      ) : null}
    </Div>
  );
}