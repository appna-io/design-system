import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="splash-fade-logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--sds-palette-primary-main)" />
        <stop offset="100%" stopColor="var(--sds-palette-primary-hover)" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#splash-fade-logo)" />
    <path
      d="M22 32 L30 40 L44 24"
      stroke="#fff"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The `fade` variant — minimal scale-in + opacity ramp. The default; reach for it when you
 * don't have brand reasons to pick another variant.
 */
export default function FadeVariant() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body">
        Calls <code>splash.fade(...)</code> — the shortcut for{' '}
        <code>splash.show(&#123; variant: &apos;fade&apos;, ... &#125;)</code>.
      </Typography>
      <Button
        onClick={() =>
          splash.fade({
            logo: Logo,
            title: 'MyApp',
            subtitle: "Welcome back — we're getting things ready.",
            timeout: 3000,
            closeOnClick: true,
          })
        }
      >
        Launch fade splash
      </Button>
    </Div>
  );
}