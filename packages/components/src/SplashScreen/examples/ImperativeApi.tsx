import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="10" width="44" height="44" rx="12" fill="var(--sds-palette-primary-main)" />
    <path
      d="M32 18 L32 30 M32 46 L32 46"
      stroke="var(--sds-palette-primary-contrast)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="32" cy="38" r="2.5" fill="var(--sds-palette-primary-contrast)" />
  </svg>
);

/**
 * The canonical "wrap an async workflow in a splash" pattern. `splash.show()` returns an id;
 * subsequent calls patch the same record. We use a stable id so re-clicking the button
 * **updates** the visible splash instead of replacing it (no entrance-animation restart).
 */
const SPLASH_ID = 'demo-async-workflow';

async function runWorkflow(): Promise<void> {
  splash.show({
    id: SPLASH_ID,
    variant: 'pulse',
    color: 'primary',
    logo: Logo,
    title: 'Connecting…',
    subtitle: 'Step 1 of 4 — handshake',
    showSpinner: true,
    closeOnEscape: true,
  });

  await sleep(900);
  splash.update(SPLASH_ID, {
    title: 'Authenticating',
    subtitle: 'Step 2 of 4 — verifying credentials',
  });

  await sleep(900);
  splash.update(SPLASH_ID, {
    variant: 'gradient',
    color: 'info',
    title: 'Loading workspace',
    subtitle: 'Step 3 of 4 — fetching layout',
    showSpinner: false,
    showProgress: true,
    progress: 30,
  });

  // Drive the progress bar to 100 over ~1.5 s.
  for (let p = 30; p <= 100; p += 10) {
    await sleep(150);
    splash.update(SPLASH_ID, { progress: p });
  }

  splash.update(SPLASH_ID, {
    variant: 'fade',
    color: 'success',
    title: 'Ready',
    subtitle: 'Step 4 of 4 — welcome back!',
    showProgress: false,
    indicator: 'none',
  });

  await sleep(800);
  splash.hide(SPLASH_ID);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ImperativeApi() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start" style={{ maxWidth: 540 }}>
      <Typography variant="body">
        Models a four-step async workflow. <code>splash.show(&#123; id &#125;)</code> opens
        the splash; <code>splash.update(id, &#123; ... &#125;)</code> patches it through each
        stage; <code>splash.hide(id)</code> closes it when work is done.
      </Typography>

      <Button onClick={runWorkflow}>Run async workflow with splash</Button>

      <Typography variant="caption" color="fg.muted">
        Notice that the entrance animation does <strong>not</strong> restart between
        updates — the same record stays mounted; only its visible props change.
      </Typography>
    </Div>
  );
}