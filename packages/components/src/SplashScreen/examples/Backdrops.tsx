import { Button, Div, Typography, splash } from '@apx-ui/ds';
import type { SplashScreenBackdrop } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="10" width="44" height="44" rx="12" fill="var(--sds-palette-primary-main)" />
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

const BACKDROPS: SplashScreenBackdrop[] = ['solid', 'paper', 'tinted', 'transparent'];

export default function Backdrops() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        The <code>backdrop</code> prop swaps the splash surface behind the content stack —
        <code> solid</code> (default) ·<code> paper</code> · <code>tinted</code> (picks up
        <code> color</code>) ·<code> transparent</code>.
      </Typography>
      <Div display="flex" flexWrap="wrap" gap="2">
        {BACKDROPS.map((b) => (
          <Button
            key={b}
            variant="outline"
            onClick={() =>
              splash.show({
                variant: 'fade',
                color: 'primary',
                backdrop: b,
                logo: Logo,
                title: b.charAt(0).toUpperCase() + b.slice(1),
                subtitle: `backdrop="${b}"`,
                timeout: 2500,
                closeOnClick: true,
              })
            }
          >
            {b}
          </Button>
        ))}
      </Div>
    </Div>
  );
}