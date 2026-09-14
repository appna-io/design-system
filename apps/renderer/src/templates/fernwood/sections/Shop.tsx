import { Badge, Div, Image, SectionHeading, Typography } from '@apx-ui/ds';

import { Stars } from '../Stars';
import { products, shopSection } from '../content';

/**
 * The product grid — the section this lane exists for.
 *
 * Two pieces of the DS are doing work here that templates used to hand-roll:
 *
 *  - **`Image hoverEffect="zoom"`** replaces the `group-hover:scale-[1.04]` + `overflow-hidden` +
 *    `transition-transform duration-700` recipe that Vantage's case-study grid still writes out by
 *    hand. Same effect, one prop, and the timing comes from the theme rather than from a number I
 *    picked.
 *  - **`hoverSrc`** swaps to the second shot on hover — the single most standard interaction in
 *    e-commerce, and previously not expressible at all. It lazy-loads the second image only on
 *    first hover, so the grid does not pay for four extra payloads most visitors never request.
 *
 * The reveal cascades **by row**, not by card: `staggerDelay` starts the group and `stagger` walks
 * it, so a four-up grid reads as two beats rather than four. Per the >6-item rule, a longer grid
 * would drop the per-item stagger entirely.
 */
export function Shop() {
  return (
    <Div as="section" id="shop" className="scroll-mt-28">
      <Div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading intro={shopSection} />

        <Div
          as="ul"
          stagger={0.08}
          staggerDelay={0.08}
          animateOnView={{ amount: 0.1 }}
          className="mt-14 grid list-none grid-cols-1 gap-x-6 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => (
            <Div as="li" key={product.id} animation="riseIn" animationDuration="slower">
              <Div
                actLike="a"
                href={product.href}
                className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
              >
                <Div className="relative">
                  <Image
                    src={product.media.src}
                    alt={product.media.alt}
                    hoverSrc={product.media.hoverSrc}
                    hoverEffect="zoom"
                    aspectRatio="4/5"
                    fit="cover"
                    radius="xl"
                    fullWidth
                    loading="lazy"
                    fallback={<Div className="h-full w-full bg-neutral-subtle" />}
                  />
                  {product.badge && (
                    <Badge
                      color="neutral"
                      shape="pill"
                      size="sm"
                      className="absolute start-3 top-3 bg-bg-paper"
                    >
                      {product.badge}
                    </Badge>
                  )}
                </Div>

                <Div className="mt-4 flex items-start justify-between gap-3">
                  <Typography
                    as="h3"
                    variant="body"
                    weight="medium"
                    letterSpacing="tight"
                    className="transition-colors group-hover:text-primary"
                  >
                    {product.name}
                  </Typography>

                  <Div className="flex shrink-0 items-baseline gap-1.5">
                    {product.compareAtPrice && (
                      <Typography variant="bodySmall" color="fg.subtle" className="line-through">
                        {product.compareAtPrice}
                      </Typography>
                    )}
                    <Typography variant="body" weight="medium">
                      {product.price}
                    </Typography>
                  </Div>
                </Div>

                <Typography
                  variant="bodySmall"
                  color="fg.muted"
                  lineHeight="relaxed"
                  className="mt-1.5"
                >
                  {product.blurb}
                </Typography>

                <Div className="mt-3 flex items-center gap-2">
                  <Stars rating={product.rating} />
                  <Typography variant="caption" color="fg.subtle">
                    {product.reviewCount} reviews
                  </Typography>
                </Div>
              </Div>
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
