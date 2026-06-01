import { Button, Div, Typography, splash } from '@apx-ui/ds';
import type { SplashScreenColor, SplashScreenVariant } from '@apx-ui/ds';

/**
 * Overview — five buttons, one per variant. Each fires `splash.show(...)` against the global
 * `<SplashProvider>` host mounted in the app shell. No local state, no inline preview — the
 * splash itself takes over the whole viewport for ~3 s and auto-dismisses.
 */

const Logo = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="10" width="44" height="44" rx="12" fill="currentColor" opacity="0.92" />
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

interface VariantDef {
  variant: SplashScreenVariant;
  color: SplashScreenColor;
  title: string;
  subtitle: string;
}

const VARIANTS: VariantDef[] = [
  { variant: 'fade', color: 'primary', title: 'Fade', subtitle: 'Minimal, clean entrance.' },
  { variant: 'pulse', color: 'danger', title: 'Pulse', subtitle: 'Live / connection feel.' },
  { variant: 'gradient', color: 'info', title: 'Gradient', subtitle: 'Brand-immersive.' },
  { variant: 'particles', color: 'warning', title: 'Particles', subtitle: 'Playful, dynamic.' },
  { variant: 'wave', color: 'success', title: 'Wave', subtitle: 'Calm, nature-leaning.' },
];

export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="body" color="fg.muted">
        Click any button to launch a real fullscreen splash via{' '}
        <code>splash.show(&#123; variant, ... &#125;)</code>. Each splash auto-closes after 3 s
        or when you press Escape / click anywhere.
      </Typography>

      <Div display="flex" flexWrap="wrap" gap="2">
        {VARIANTS.map((v) => (
          <Button
            key={v.variant}
            color={v.color}
            onClick={() =>
              splash.show({
                variant: v.variant,
                color: v.color,
                logo: Logo,
                title: v.title,
                subtitle: v.subtitle,
                timeout: 3000,
                closeOnClick: true,
              })
            }
          >
            Launch · {v.title}
          </Button>
        ))}
      </Div>

      <Typography variant="caption" color="fg.muted">
        Tip: the variant shortcut <code>splash.pulse(&#123; ... &#125;)</code> is equivalent
        to <code>splash.show(&#123; variant: 'pulse', ... &#125;)</code>.
      </Typography>
    </Div>
  );
}