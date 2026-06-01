import { Button, Div, Typography, splash } from '@apx-ui/ds';

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="10" width="44" height="44" rx="14" fill="rgba(255,255,255,0.92)" />
    <path d="M22 42 L32 22 L42 42 Z" fill="#111827" />
  </svg>
);

/**
 * Three buttons, three ways to paint a custom gradient. The default `splash.gradient()` picks
 * from the 7 per-role palette presets (`SPLASH_GRADIENT_BY_COLOR[color]`) — the new
 * `gradient` prop lets you override that with arbitrary colors.
 */
export default function CustomGradient() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start" style={{ maxWidth: 560 }}>
      <Typography variant="body">
        Pass <code>gradient</code> to override the default per-role gradient. Three input
        shapes — pick whichever matches how you carry your brand colors.
      </Typography>

      <Div display="flex" flexWrap="wrap" gap="2">
        <Button
          onClick={() =>
            splash.gradient({
              gradient: ['#ff5722', '#ffeb3b', '#4caf50'],
              logo: Logo,
              title: 'Sunset',
              subtitle: "gradient: ['#ff5722', '#ffeb3b', '#4caf50']",
              showSpinner: true,
              timeout: 4000,
              closeOnClick: true,
            })
          }
        >
          Stop array
        </Button>

        <Button
          onClick={() =>
            splash.gradient({
              gradient: { from: '#0ea5e9', via: '#8b5cf6', to: '#ec4899', angle: 120 },
              logo: Logo,
              title: 'Vaporwave',
              subtitle: 'gradient: { from, via, to, angle: 120 }',
              showSpinner: true,
              timeout: 4000,
              closeOnClick: true,
            })
          }
        >
          {'{ from, via, to, angle }'}
        </Button>

        <Button
          onClick={() =>
            splash.gradient({
              gradient: 'radial-gradient(circle at 30% 30%, #fb923c 0%, #1e293b 70%)',
              logo: Logo,
              title: 'Aurora',
              subtitle: 'gradient: "radial-gradient(...)"',
              showSpinner: true,
              timeout: 4000,
              closeOnClick: true,
            })
          }
        >
          Full CSS string
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            splash.gradient({
              gradient: {
                from: 'var(--sds-palette-primary-main)',
                to: 'var(--sds-palette-info-main)',
              },
              logo: Logo,
              title: 'Theme-aware',
              subtitle: 'gradient: { from: var(--sds-…), to: var(--sds-…) }',
              showSpinner: true,
              timeout: 4000,
              closeOnClick: true,
            })
          }
        >
          Theme tokens
        </Button>

        <Button
          variant="outline"
          color="warning"
          onClick={() =>
            splash.gradient({
              color: 'warning',
              // Reshape the engine-built default — radial instead of linear, with the
              // active/hover/active stops for a darker peak. Still theme-derived.
              gradient: { kind: 'radial', stops: ['active', 'hover', 'active'] },
              logo: Logo,
              title: 'Reshaped default',
              subtitle: "gradient: { kind: 'radial', stops: [...] }",
              showSpinner: true,
              timeout: 4000,
              closeOnClick: true,
            })
          }
        >
          Reshape default
        </Button>
      </Div>

      <Typography variant="caption" color="fg.muted">
        Tip: <code>var(--sds-palette-&#123;role&#125;-main)</code> tokens flip with light /
        dark mode automatically, so a custom gradient built from them still re-tints under
        the active theme.
      </Typography>
    </Div>
  );
}