'use client';

import { Check } from 'lucide-react';
import { type ReactNode } from 'react';

import { forwardRef } from '@apx-ui/engine';

import { Badge } from '../Badge/Badge';
import { Card } from '../Card';
import { Div } from '../Div';
import { Typography } from '../Typography/Typography';

import type { PricingCardFeatureColor, PricingCardProps } from './PricingCard.types';

/**
 * `<PricingCard />` — opinionated, fully-themed **pricing tier** primitive.
 *
 * The Aurora landing page (and most SaaS pricing surfaces) repeats the same shape on
 * every tier: name + headline price + cadence + blurb + checkmark feature list +
 * call-to-action button, plus a "most popular" treatment that elevates one tier.
 * Hand-rolling that with `<Card.Header>` / `<Card.Body>` / `<Card.Footer>` reads as
 * ~60 LoC per tier — purely structural code that distracts from the actual data.
 *
 * `<PricingCard />` collapses every recurring decision into a typed prop:
 *
 *   <PricingCard
 *     name="Team"
 *     price="$12"
 *     cadence="per seat / month, billed yearly"
 *     blurb="For growing teams that need richer collaboration & analytics."
 *     features={['Unlimited collaborators', '90-day audit log + SSO']}
 *     cta={<Button>Start 14-day trial</Button>}
 *     highlighted
 *   />
 *
 * Internally it composes `<Card>` + its subparts, so consumer-side theming, RTL,
 * and the existing Card a11y story all keep working. `variant` / `size` / `color`
 * forward to the underlying Card; everything else is a pricing-specific shortcut.
 *
 * The `highlighted` flag wires three correlated decisions in one switch:
 *   - `<Card variant="elevated" selected />` (recommended-tier visual);
 *   - a `<Badge>` next to the name (`highlightLabel`, default "Most popular");
 *   - the `color` ring + badge tint.
 *
 * Pass `highlightLabel={null}` to keep the elevated/selected ring without the badge.
 */
export const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(
  function PricingCard(props, ref) {
    const {
      name,
      price,
      cadence,
      blurb,
      features,
      cta,
      highlighted = false,
      highlightLabel = 'Most popular',
      color = 'primary',
      featureIcon,
      featureIconColor = 'success',
      variant,
      size = 'lg',
      className,
      sx,
      style,
      ...rest
    } = props;

    // Defaults track `highlighted` so a bare `<PricingCard ... highlighted />` produces
    // the canonical recommended-tier visual without configuration. Consumers can still
    // pin the variant explicitly (e.g. `variant="outline"` to keep all tiers visually flat).
    const resolvedVariant = variant ?? (highlighted ? 'elevated' : 'outline');
    const resolvedColor = highlighted ? color : 'neutral';

    const bulletIcon = featureIcon ?? <Check size={16} aria-hidden />;
    const bulletColorClass = FEATURE_ICON_COLOR_CLASS[featureIconColor];

    return (
      <Card
        ref={ref}
        variant={resolvedVariant}
        size={size}
        color={resolvedColor}
        selected={highlighted}
        className={['flex h-full flex-col', className].filter(Boolean).join(' ')}
        sx={sx}
        style={style}
        {...rest}
      >
        <Card.Header
          title={
            <Div as="span" className="flex items-center gap-2">
              <Typography as="span" variant="body" weight="semibold">
                {name}
              </Typography>
              {highlighted && highlightLabel != null ? (
                <Badge variant="solid" color={color} size="sm" shape="pill">
                  {highlightLabel}
                </Badge>
              ) : null}
            </Div>
          }
        />

        <Card.Body className="flex flex-1 flex-col gap-5">
          <Div>
            <Div className="flex items-baseline gap-1">
              <Typography
                as="span"
                variant="display"
                weight="semibold"
                letterSpacing="tight"
                className="text-4xl"
              >
                {price}
              </Typography>
            </Div>
            {cadence != null ? (
              <Typography variant="caption" color="fg.muted" className="mt-1">
                {cadence}
              </Typography>
            ) : null}
          </Div>

          {blurb != null ? (
            <Typography variant="bodySmall" color="fg.muted" lineHeight="relaxed">
              {blurb}
            </Typography>
          ) : null}

          {features && features.length > 0 ? (
            <Div as="ul" className="space-y-2.5">
              {features.map((feature, index) => (
                <Div as="li" key={index} className="flex items-start gap-2">
                  <Div
                    as="span"
                    aria-hidden
                    className={`mt-0.5 flex-shrink-0 ${bulletColorClass}`}
                  >
                    {bulletIcon}
                  </Div>
                  {typeof feature === 'string' ? (
                    <Typography as="span" variant="bodySmall">
                      {feature}
                    </Typography>
                  ) : (
                    feature
                  )}
                </Div>
              ))}
            </Div>
          ) : null}
        </Card.Body>

        {cta != null ? <Card.Footer align="center">{wrapCta(cta)}</Card.Footer> : null}
      </Card>
    );
  },
  'PricingCard',
);

/**
 * Tailwind utility class per palette role for the feature bullet icon. Listed flat
 * (rather than templated) so the JIT scanner discovers every literal at build time.
 */
const FEATURE_ICON_COLOR_CLASS: Record<PricingCardFeatureColor, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-fg-muted',
};

/**
 * If `cta` is a primitive (string / number), wrap it in a `<Typography>` so it
 * picks up the surrounding footer styling. ReactNodes pass through so consumers
 * can drop in any `<Button>` configuration they prefer.
 */
function wrapCta(cta: ReactNode): ReactNode {
  if (typeof cta === 'string' || typeof cta === 'number') {
    return (
      <Typography as="span" variant="bodySmall" weight="medium">
        {cta}
      </Typography>
    );
  }
  return cta;
}