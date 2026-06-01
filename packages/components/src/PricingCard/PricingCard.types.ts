import type { HTMLAttributes, ReactNode } from 'react';
import type { Sx } from '@apx-ui/engine';
import type { CardColor, CardSize, CardVariant } from '../Card/Card.types';

/**
 * Per-feature bullet color. Mirrors {@link CardColor}, but defaults to `success`
 * because a green checkmark is the de-facto convention for "this plan includes
 * X" lists.
 */
export type PricingCardFeatureColor = CardColor;

export interface PricingCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
  /**
   * Tier name (e.g. `"Starter"`, `"Team"`, `"Enterprise"`). Renders bold next to
   * the optional highlight badge inside the card header.
   */
  name: ReactNode;
  /**
   * Headline price (e.g. `"$0"`, `"$12"`, `"Custom"`). Rendered display-size so it
   * dominates the card hierarchy.
   */
  price: ReactNode;
  /**
   * Cadence text below the price (e.g. `"per seat / month, billed yearly"`,
   * `"forever, up to 5 seats"`). Optional — short prices like `"Custom"` may not
   * need one.
   */
  cadence?: ReactNode;
  /**
   * Blurb / one-line description between the price and the feature list.
   * Optional — omit on the cheapest tier where the features speak for themselves.
   */
  blurb?: ReactNode;
  /**
   * Feature list — each item is rendered as a row with a bullet icon (`featureIcon`)
   * on the leading edge. Plain strings are wrapped in `<Typography>`; pass any
   * `ReactNode` for richer content (links, icons, etc.).
   */
  features?: readonly ReactNode[] | undefined;
  /**
   * Call-to-action element. Typically a `<Button>` so consumers retain control over
   * variant / color / size, but any `ReactNode` is accepted. Sits inside the card
   * footer at full inline width.
   */
  cta?: ReactNode;
  /**
   * Marks this tier as the recommended one. Adds the highlight badge next to the
   * `name`, switches the underlying `<Card>` to `variant="elevated" selected`, and
   * tints the selection ring with the configured `color`.
   */
  highlighted?: boolean | undefined;
  /**
   * Text shown in the highlight badge when `highlighted` is true. Set to `null` to
   * suppress the badge while keeping the elevated/selected ring.
   * @default 'Most popular'
   */
  highlightLabel?: ReactNode;
  /**
   * Palette role used for the highlight badge + selection ring + (default) feature
   * bullet color. @default 'primary'
   */
  color?: CardColor;
  /**
   * Per-feature bullet icon. Defaults to a checkmark from `lucide-react`. Pass any
   * `ReactNode` to override (e.g. a sparkles icon for "premium" features).
   */
  featureIcon?: ReactNode;
  /**
   * Palette role used to tint the feature bullet icon. @default 'success'
   */
  featureIconColor?: PricingCardFeatureColor;
  /**
   * Override the underlying `<Card>` `variant` prop. Defaults track the
   * `highlighted` flag (`'elevated'` when highlighted, `'outline'` otherwise) so
   * the canonical recommended-tier visual works without configuration.
   */
  variant?: CardVariant;
  /**
   * Override the underlying `<Card>` `size` prop (drives padding density on
   * Header / Body / Footer). @default 'lg'
   */
  size?: CardSize;
  /** Theme-aware inline style object — forwarded to the underlying `<Card>`. */
  sx?: Sx;
}