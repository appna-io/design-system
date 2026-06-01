import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect
      x="10"
      y="10"
      width="44"
      height="44"
      rx="14"
      fill="var(--sds-palette-background-paper)"
      stroke="var(--sds-palette-primary-contrast)"
      strokeWidth="2"
    />
    <path d="M22 42 L32 22 L42 42 Z" fill="var(--sds-palette-primary-contrast)" />
  </svg>
);

/**
 * The `gradient` variant — animated multi-stop gradient backdrop. Marketing-grade
 * brand-immersive splash. Pairs well with a determinate progress bar.
 */
export default function GradientVariant() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Diagonal gradient that drifts across the viewport every 8 s. The 62% progress bar is
        static here — see <strong>WithProgress</strong> for the live-driven version.
      </Typography>
      <Button
        onClick={() =>
          splash.gradient({
            logo: Logo,
            title: 'Welcome to Apex',
            subtitle: 'Loading your personalized workspace…',
            showProgress: true,
            progress: 62,
            timeout: 4000,
            closeOnClick: true,
          })
        }
      >
        Launch gradient splash
      </Button>
    </Div>
  );
}