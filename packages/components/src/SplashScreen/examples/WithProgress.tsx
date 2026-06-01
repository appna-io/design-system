import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="8" width="48" height="48" rx="10" fill="var(--sds-palette-info-main)" />
    <path
      d="M22 28 L42 28 M22 36 L36 36"
      stroke="var(--sds-palette-info-contrast)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Demonstrates the canonical "drive a progress bar from async work" pattern. `splash.show()`
 * returns an id; subsequent `splash.update(id, { progress })` calls patch the active record
 * in place without re-running the entrance animation.
 */
export default function WithProgress() {
  function launch() {
    const id = splash.gradient({
      color: 'info',
      logo: Logo,
      title: 'Loading workspace',
      subtitle: 'Downloading assets — 0%',
      showProgress: true,
      progress: 0,
      footer: '© 2026 Acme Inc.',
      // No timeout — we close manually when progress hits 100%.
      closeOnClick: true,
      closeOnEscape: true,
      onHide: () => clearInterval(handle),
    });

    let value = 0;
    const handle = window.setInterval(() => {
      value = Math.min(100, value + 5);
      splash.update(id, {
        progress: value,
        subtitle: `Downloading assets — ${value}%`,
      });
      if (value >= 100) {
        window.clearInterval(handle);
        window.setTimeout(() => splash.hide(id), 400);
      }
    }, 180);
  }

  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Calls <code>splash.update(id, &#123; progress &#125;)</code> at 180 ms intervals to
        drive the bar from 0 → 100% over ~3.5 s. The splash hides itself when complete.
      </Typography>
      <Button color="info" onClick={launch}>
        Launch splash with live progress
      </Button>
    </Div>
  );
}