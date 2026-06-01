import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="22" fill="var(--sds-palette-info-main)" />
    <path
      d="M20 38 Q32 24 44 38"
      stroke="var(--sds-palette-info-contrast)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="32" cy="24" r="3" fill="var(--sds-palette-info-contrast)" />
  </svg>
);

/**
 * The `particles` variant — eight inner + four outer particles orbiting the logo on
 * counter-rotating rings, each with its own breathing cadence. Playful, consumer-app vibe.
 */
export default function ParticlesVariant() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Two stacked orbits (8 inner + 4 outer particles), counter-rotating, each particle on
        its own breathing cadence.
      </Typography>
      <Button
        color="info"
        onClick={() =>
          splash.particles({
            color: 'info',
            logo: Logo,
            title: 'Apex Studio',
            subtitle: 'Preparing the canvas — just a moment.',
            timeout: 4000,
            closeOnClick: true,
          })
        }
      >
        Launch particles splash
      </Button>
    </Div>
  );
}