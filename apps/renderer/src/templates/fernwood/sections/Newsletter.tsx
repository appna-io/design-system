import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Input, Surface, Typography } from '@apx-ui/ds';

import { newsletter } from '../content';

/**
 * Closing band, and the template's **only** brand fill — the one-brand-band rule held without an
 * amendment, unlike the duotone lanes that had to argue for an exception.
 *
 * `<Surface tone="primary">` establishes the ground, so everything inside is written exactly as it
 * would be on paper: the heading reads plain `foreground` tokens, the `Input` needs no colour
 * props, and the button asks for `color="neutral"` — which the tone has re-pointed at the brand's
 * contrast slot. No `var(--sds-…)` anywhere.
 *
 * The form is a real `<form>` with a labelled input rather than a decorative row. A newsletter
 * block that cannot be submitted with the keyboard is a screenshot, not a section.
 */
export function Newsletter() {
  return (
    <Surface as="section" tone="primary" id="journal" className="scroll-mt-28">
      <Div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <Div
          animation="riseIn"
          animateOnView
          animationDuration="slower"
          animationEase="emphasized"
        >
          <Typography
            variant="overline"
            weight="medium"
            color="fg.muted"
            transform="upper"
            letterSpacing="widest"
            className="text-xs"
          >
            {newsletter.eyebrow}
          </Typography>

          <Typography
            as="h2"
            variant="displayLg"
            weight="medium"
            lineHeight="tight"
            letterSpacing="tight"
            fontFamily="display"
            className="mt-4"
          >
            {newsletter.title}
          </Typography>

          <Typography
            variant="bodyLarge"
            color="fg.muted"
            lineHeight="relaxed"
            className="mx-auto mt-5 max-w-xl"
          >
            {newsletter.body}
          </Typography>

          <Div
            as="form"
            className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(event: React.FormEvent) => event.preventDefault()}
          >
            <Div className="flex-1">
              <label htmlFor="fernwood-email" className="sr-only">
                Email address
              </label>
              <Input
                id="fernwood-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                fullWidth
                size="lg"
              />
            </Div>
            <Button type="submit" size="lg" color="neutral" rightIcon={<ArrowRight size={18} />}>
              {newsletter.cta.label}
            </Button>
          </Div>

          <Typography variant="caption" color="fg.muted" className="mt-4 block">
            {newsletter.footnote}
          </Typography>
        </Div>
      </Div>
    </Surface>
  );
}
