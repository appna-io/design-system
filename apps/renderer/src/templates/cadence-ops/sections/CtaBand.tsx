import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { ctaBand } from '../data';

/**
 * Closing band on the inverted surface. Like the other templates' dark bands it swaps palette
 * *roles* — surface `primary`, type `primary.contrast` — rather than naming colours, so
 * recolouring the primary role re-skins it along with the buttons and the brand tile.
 *
 * The secondary action needs the contrast token inline: `ButtonColor` has no inverse / on-dark
 * role, so an outlined light button on a primary fill cannot be expressed through the prop API.
 * Same DS gap [#10](/issues/10) records, minimum surface area.
 */
const ON_PRIMARY_OUTLINE = {
  borderColor: 'var(--sds-palette-primary-contrast)',
  color: 'var(--sds-palette-primary-contrast)',
} as const;

/** The matching solid: contrast fill, primary text. Same gap, same reason. */
const ON_PRIMARY_SOLID = {
  backgroundColor: 'var(--sds-palette-primary-contrast)',
  color: 'var(--sds-palette-primary-main)',
} as const;

export function CtaBand() {
  return (
    <Div as="section" id="demo" className="relative overflow-hidden bg-primary py-20 lg:py-24">
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
        <SectionHeading eyebrow="Get started" title={ctaBand.title} body={ctaBand.body} onDark />

        <Div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" style={ON_PRIMARY_SOLID} asChild>
            <a href={ctaBand.primaryCta.href} className="inline-flex items-center gap-2">
              {ctaBand.primaryCta.label}
              <ArrowRight size={18} />
            </a>
          </Button>
          <Button size="lg" variant="outline" style={ON_PRIMARY_OUTLINE} asChild>
            <a href={ctaBand.secondaryCta.href}>{ctaBand.secondaryCta.label}</a>
          </Button>
        </Div>

        <Typography variant="bodySmall" color="primary.contrast" className="mt-6 block opacity-70">
          {ctaBand.footnote}
        </Typography>
      </Div>
    </Div>
  );
}
