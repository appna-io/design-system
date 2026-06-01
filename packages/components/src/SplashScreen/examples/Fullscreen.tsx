import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="splash-fullscreen-logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--sds-palette-primary-contrast)" />
        <stop offset="100%" stopColor="var(--sds-palette-info-contrast)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="22" fill="url(#splash-fullscreen-logo)" />
    <path
      d="M24 38 Q32 26 40 38"
      stroke="var(--sds-palette-primary-main)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="32" cy="26" r="3" fill="var(--sds-palette-primary-main)" />
  </svg>
);

/**
 * The canonical use case: a splash that takes over the entire viewport, dismissible via
 * click or Escape, with a long timeout as a safety net.
 */
export default function Fullscreen() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        A real fullscreen splash via the imperative <code>splash.show(...)</code> facade.
        Escape or click anywhere to dismiss — or wait 6 s for the timeout.
      </Typography>
      <Button
        onClick={() =>
          splash.show({
            variant: 'gradient',
            color: 'primary',
            logo: Logo,
            title: 'Apex Workspace',
            subtitle: 'Initializing your environment…',
            showSpinner: true,
            footer: 'v2.4.0 · build 1843',
            timeout: 6000,
            closeOnClick: true,
            closeOnEscape: true,
          })
        }
      >
        Launch fullscreen splash
      </Button>
    </Div>
  );
}