'use client';

import { useState, type SyntheticEvent } from 'react';
import { Button, Div, Input, Surface, Typography } from '@apx-ui/ds';

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
 * Everything inside is written as it would be on a light page. `<Surface tone="primary">` does the
 * rest: the source's translucent-white "glass" field is `Input variant="solid"`, whose `bg-bg-subtle`
 * the tone resolves to 12% cream mixed into espresso — the same value the port previously spelled
 * out as a `color-mix()` inline style — and the cream-on-espresso submit is `color="neutral"`,
 * because the tone points the neutral role at the contrast slot. Both used to need raw
 * `var(--sds-…)` at the call site, along with an arbitrary Tailwind selector for the placeholder.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <Surface as="section" tone="primary" className="relative overflow-hidden py-16 lg:py-20">
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
        <SectionHeading title={newsletter.title} body={newsletter.body} align="center" />

        {submitted ? (
          <Typography
            variant="body"
            weight="medium"
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
              variant="solid"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletter.placeholder}
              aria-label={newsletter.emailLabel}
              className="backdrop-blur"
            />
            <Button type="submit" size="lg" color="neutral" className="shrink-0">
              {newsletter.submitLabel}
            </Button>
          </Div>
        )}

        <Typography variant="bodySmall" color="fg.muted" className="mt-8">
          {newsletter.footnote}{' '}
          <Typography
            actLike="a"
            href={newsletter.footnoteLink.href}
            variant="bodySmall"
            weight="semibold"
            className="underline underline-offset-4 transition hover:opacity-100"
          >
            {newsletter.footnoteLink.label}
          </Typography>
        </Typography>
      </Div>
    </Surface>
  );
}
