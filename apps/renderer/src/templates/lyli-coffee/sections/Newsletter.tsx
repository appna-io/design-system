'use client';

import { useState, type SyntheticEvent } from 'react';
import { Button, Div, Input, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { newsletter } from '../data';

/**
 * The dark gradient band. Two-stop roast → espresso, via `Div`'s typed `gradient` prop rather
 * than a literal `bg-gradient-to-r` — the stops are palette tokens, so the band tracks the
 * theme.
 *
 * The source's form was a client-side no-op (`onSubmit={e => e.preventDefault()}`). Kept as a
 * no-op, but with a real success state so the section isn't a dead input.
 *
 * The input is the one place this port could not reach for a DS variant: the source styles it
 * as translucent white glass on the dark band (`bg-white/10 + backdrop-blur`), and `Input` has
 * no on-dark treatment. Filed as a DS gap rather than pretending the className is the design.
 */
/**
 * Translucent "glass" field on the dark band.
 *
 * Written with `color-mix()` against the palette token rather than Tailwind's `/opacity`
 * modifier: the DS preset maps colors to raw `var(--sds-…)` strings, which carry no
 * `<alpha-value>` placeholder, so `bg-primary-contrast/10` compiles to nothing and the field
 * renders fully transparent. `color-mix` keeps the value token-driven and theme-tracking.
 */
const GLASS_FIELD = {
  backgroundColor: 'color-mix(in srgb, var(--sds-palette-primary-contrast) 12%, transparent)',
  color: 'var(--sds-palette-primary-contrast)',
} as const;

/**
 * Cream-on-espresso submit button, matching the source's `bg-cream-50 text-espresso-900`.
 *
 * `ButtonColor` has no inverse/on-dark role — every option paints a chromatic fill, so a light
 * button on a dark band has to be expressed with the palette's contrast token directly. Same
 * on-dark gap as the field above.
 */
const INVERSE_BUTTON = {
  backgroundColor: 'var(--sds-palette-primary-contrast)',
  color: 'var(--sds-palette-primary-main)',
} as const;

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <Div as="section" className="relative overflow-hidden bg-primary py-16 lg:py-20">
      <Div
        decorative
        gradient={{
          type: 'linear',
          from: 'secondary.active',
          to: 'primary.main',
          position: 'right',
        }}
      />
      <Div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <SectionHeading title={newsletter.title} body={newsletter.body} align="center" onDark />

        {submitted ? (
          <Typography
            variant="body"
            weight="medium"
            color="primary.contrast"
            className="mx-auto mt-8 max-w-md"
            aria-live="polite"
          >
            Thanks — you&rsquo;re on the list.
          </Typography>
        ) : (
          <Div
            as="form"
            onSubmit={handleSubmit}
            aria-label="Newsletter signup"
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              id="newsletter-email"
              type="email"
              name="email"
              required
              fullWidth
              size="lg"
              variant="ghost"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletter.placeholder}
              aria-label={newsletter.emailLabel}
              style={GLASS_FIELD}
              className="backdrop-blur [&_input]:placeholder:text-[color-mix(in_srgb,var(--sds-palette-primary-contrast)_60%,transparent)]"
            />
            <Button type="submit" size="lg" style={INVERSE_BUTTON} className="shrink-0">
              {newsletter.submitLabel}
            </Button>
          </Div>
        )}

        <Typography variant="bodySmall" color="primary.contrast" className="mt-8 opacity-80">
          {newsletter.footnote}{' '}
          <Typography
            actLike="a"
            href={newsletter.footnoteLink.href}
            variant="bodySmall"
            weight="semibold"
            color="primary.contrast"
            className="underline underline-offset-4 transition hover:opacity-100"
          >
            {newsletter.footnoteLink.label}
          </Typography>
        </Typography>
      </Div>
    </Div>
  );
}
