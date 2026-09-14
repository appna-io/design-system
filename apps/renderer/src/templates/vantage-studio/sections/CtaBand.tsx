import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Reveal, Section, Typography } from '@apx-ui/ds';

import { cta } from '../data';

/**
 * Closing ask, on the accent fill.
 *
 * `<Surface tone="primary">` establishes the ground, so everything inside is written exactly as it
 * would be on a white page: the type asks for plain `foreground` tokens and both buttons ask for
 * `color="neutral"`, which the tone has re-pointed at the brand's contrast slot.
 *
 * This band previously carried two inline `style` objects reaching for
 * `var(--sds-palette-primary-contrast)` — one to tint the outline button's border, one for its
 * label — because the DS had no on-brand role to ask for. #4 added it; those escapes are gone and
 * the band re-skins with the palette instead of being pinned to a variable name.
 */
export function CtaBand() {
  return (
    <Section as="section" tone="primary" id="contact" width="wide">
      <Reveal className="mx-auto max-w-3xl text-center">
          <Typography
            variant="overline"
            weight="medium"
            color="fg.muted"
            transform="upper"
            letterSpacing="widest"
            className="text-xs"
          >
            {cta.eyebrow}
          </Typography>

          <Typography
            as="h2"
            variant="displayLg"
            weight="medium"
            lineHeight="tight"
            letterSpacing="tight"
            fontFamily="display"
            className="mt-5"
          >
            {cta.title}
          </Typography>

          <Typography
            variant="bodyLarge"
            lineHeight="relaxed"
            color="fg.muted"
            className="mx-auto mt-6 max-w-xl"
          >
            {cta.body}
          </Typography>

          <Div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" color="neutral" rightIcon={<ArrowRight size={18} />} asChild>
              <a href={cta.primary.href}>{cta.primary.label}</a>
            </Button>
            <Button size="lg" variant="outline" color="neutral" asChild>
              <a href={cta.secondary.href}>{cta.secondary.label}</a>
            </Button>
          </Div>
      </Reveal>
    </Section>
  );
}
