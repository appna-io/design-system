import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="24" fill="var(--sds-palette-success-main)" />
    <path
      d="M16 38 Q24 30 32 36 T48 34"
      stroke="var(--sds-palette-success-contrast)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="32" cy="22" r="3" fill="var(--sds-palette-success-contrast)" />
  </svg>
);

/**
 * The `wave` variant — two parallaxing wave bands pinned to the viewport bottom. Calm,
 * nature-leaning brands.
 */
export default function WaveVariant() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Two SVG wave bands at the bottom parallax against each other. Backdrop set to
        <code> paper</code> for a softer base behind the success-colored brand.
      </Typography>
      <Button
        color="success"
        onClick={() =>
          splash.wave({
            color: 'success',
            backdrop: 'paper',
            logo: Logo,
            title: 'Voyage',
            subtitle: 'Charting your next destination.',
            showSpinner: true,
            timeout: 4000,
            closeOnClick: true,
          })
        }
      >
        Launch wave splash
      </Button>
    </Div>
  );
}