import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, SectionHeading, Surface, Typography } from '@apx-ui/ds';

import { ctaBand } from '../data';

/**
 * Closing band on the brand fill.
 *
 * `<Surface tone="primary">` establishes the ground, so everything inside is written exactly as it
 * would be on a white page: the heading reads plain `foreground` tokens, and both buttons ask for
 * `color="neutral"` — which the tone has re-pointed at the brand's contrast slot, giving the white
 * fill / violet label pair this band wants. Previously the two buttons and the heading's chip each
 * carried an inline `style` reaching for `var(--sds-palette-primary-contrast)`, because the DS had
 * no on-brand role to ask for.
 */
export function CtaBand() {
  return (
    <Surface
      as="section"
      tone="primary"
      id="demo"
      className="relative overflow-hidden py-20 lg:py-24"
    >
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'primary.hover',
          to: 'transparent',
          position: 'top-right',
          size: '70% 120%',
        }}
      />

      <Div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Get started" title={ctaBand.title} body={ctaBand.body} />

        <Div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" color="neutral" asChild>
            <a href={ctaBand.primaryCta.href} className="inline-flex items-center gap-2">
              {ctaBand.primaryCta.label}
              <ArrowRight size={18} />
            </a>
          </Button>
          <Button size="lg" variant="outline" color="neutral" asChild>
            <a href={ctaBand.secondaryCta.href}>{ctaBand.secondaryCta.label}</a>
          </Button>
        </Div>

        <Typography variant="bodySmall" color="fg.muted" className="mt-6 block">
          {ctaBand.footnote}
        </Typography>
      </Div>
    </Surface>
  );
}
