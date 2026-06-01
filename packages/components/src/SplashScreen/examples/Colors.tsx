import { Button, Div, Typography, splash } from '@apx-ui/ds';
import type { SplashScreenColor } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="22" fill="currentColor" />
    <path
      d="M22 32 L30 40 L44 24"
      stroke="var(--sds-palette-background-paper)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const COLORS: SplashScreenColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        The <code>color</code> prop drives all the splash accents — pulse rings, particle
        dots, wave fills, gradient stops, the indicator. Click a role to see it on the{' '}
        <code>pulse</code> variant.
      </Typography>
      <Div display="flex" flexWrap="wrap" gap="2">
        {COLORS.map((c) => (
          <Button
            key={c}
            color={c}
            variant="outline"
            onClick={() =>
              splash.pulse({
                color: c,
                logo: Logo,
                title: c.charAt(0).toUpperCase() + c.slice(1),
                subtitle: `Pulse · color="${c}"`,
                showSpinner: true,
                timeout: 2500,
                closeOnClick: true,
              })
            }
          >
            {c}
          </Button>
        ))}
      </Div>
    </Div>
  );
}