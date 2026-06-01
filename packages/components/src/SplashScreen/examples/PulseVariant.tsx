import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="20" fill="var(--sds-palette-primary-main)" />
    <circle cx="32" cy="32" r="8" fill="var(--sds-palette-background-default)" />
  </svg>
);

/**
 * The `pulse` variant — three concentric radar rings expanding around the logo. The "live"
 * affordance — pairs well with a Spinner indicator.
 */
export default function PulseVariant() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Pulse rings + indeterminate spinner — a connection / sync moment.
      </Typography>
      <Button
        onClick={() =>
          splash.pulse({
            logo: Logo,
            title: 'Syncing',
            subtitle: 'Establishing a secure connection.',
            showSpinner: true,
            timeout: 3000,
            closeOnClick: true,
          })
        }
      >
        Launch pulse splash
      </Button>
    </Div>
  );
}