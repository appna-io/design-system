import { Avatar, Badge, Div, Typography } from '@apx-ui/ds';

import { testimonial } from '../data';

/**
 * One quote, given the whole band. Three small testimonial cards is the default move and it is
 * the wrong one here: a field-ops buyer wants one operator who ran their exact problem, at
 * length, not three sentences from three strangers.
 *
 * Real `<blockquote>` / `<cite>` elements — the DS has no `Quote` primitive and does not need
 * one, the semantics live in the elements. `not-italic` matches the design against the
 * browser's default `<cite>` styling.
 */
export function Testimonial() {
  return (
    <Div as="section" className="bg-bg-subtle py-20 lg:py-28">
      <Div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Badge variant="soft" color="primary" shape="pill" size="sm">
          {testimonial.eyebrow}
        </Badge>

        <Typography as="blockquote" className="mt-8 block">
          <Typography
            variant="h3"
            weight="medium"
            lineHeight="snug"
            letterSpacing="tight"
            fontFamily="display"
            className="text-xl sm:text-2xl lg:text-3xl"
          >
            &ldquo;{testimonial.quote}&rdquo;
          </Typography>

          <Div as="footer" className="mt-10 flex items-center justify-center gap-4">
            <Avatar name={testimonial.name} size="lg" ring="primary" />
            <Typography as="cite" className="block text-start not-italic">
              <Typography as="span" variant="body" weight="semibold" display="block">
                {testimonial.name}
              </Typography>
              <Typography as="span" variant="bodySmall" color="foreground.muted" display="block">
                {testimonial.role}
              </Typography>
              <Typography as="span" variant="caption" color="foreground.subtle" display="block">
                {testimonial.detail}
              </Typography>
            </Typography>
          </Div>
        </Typography>
      </Div>
    </Div>
  );
}
