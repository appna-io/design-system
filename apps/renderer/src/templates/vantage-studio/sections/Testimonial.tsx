import { Avatar, Div, Reveal, Section, Typography } from '@apx-ui/ds';

import { testimonial } from '../data';

/**
 * A single quote, set at display size.
 *
 * `blurIn` is used exactly once on this page, and it is here. The preset re-rasterises a blurred
 * layer for every intermediate frame, so it is reserved for one element per viewport — spending
 * it on the page's only pull-quote is the trade that earns the cost.
 */
export function Testimonial() {
  return (
    <Section as="section" width="wide" rhythm="spacious">
      <Reveal preset="blur" emphasis className="mx-auto max-w-5xl text-center">
          <Typography
            as="blockquote"
            variant="h2"
            weight="medium"
            lineHeight="snug"
            letterSpacing="tight"
            fontFamily="display"
            className="text-2xl sm:text-3xl lg:text-[2.75rem]"
          >
            &ldquo;{testimonial.quote}&rdquo;
          </Typography>

          <Div className="mt-10 flex items-center justify-center gap-4">
            <Avatar
              src={testimonial.avatar}
              name={testimonial.name}
              alt={testimonial.name}
              size="md"
              shape="square"
            />
            <Div className="text-start">
              <Typography variant="bodySmall" weight="medium">
                {testimonial.name}
              </Typography>
              <Typography variant="bodySmall" color="fg.subtle">
                {testimonial.role}
              </Typography>
            </Div>
          </Div>
      </Reveal>
    </Section>
  );
}
