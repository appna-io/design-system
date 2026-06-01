import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/Button/Button';
import { PricingCard } from '../src/PricingCard';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('PricingCard — content rendering', () => {
  it('renders the name, price, cadence, blurb, every feature, and the CTA', () => {
    const { getByText, getAllByRole } = render(
      <PricingCard
        name="Team"
        price="$12"
        cadence="per seat / month"
        blurb="Growing teams that need richer collaboration."
        features={['Unlimited collaborators', 'SSO', '90-day audit log']}
        cta={<Button>Start trial</Button>}
      />,
    );

    expect(getByText('Team')).toBeInTheDocument();
    expect(getByText('$12')).toBeInTheDocument();
    expect(getByText('per seat / month')).toBeInTheDocument();
    expect(getByText('Growing teams that need richer collaboration.')).toBeInTheDocument();
    expect(getByText('Unlimited collaborators')).toBeInTheDocument();
    expect(getByText('SSO')).toBeInTheDocument();
    expect(getByText('90-day audit log')).toBeInTheDocument();

    const items = getAllByRole('listitem');
    expect(items).toHaveLength(3);

    expect(getByText('Start trial')).toBeInTheDocument();
  });

  it('omits the cadence, blurb, features, and footer when their props are absent', () => {
    const { queryByRole, queryByText, getByText } = render(
      <PricingCard name="Free" price="$0" />,
    );

    expect(getByText('Free')).toBeInTheDocument();
    expect(getByText('$0')).toBeInTheDocument();

    // No feature list, no CTA, no blurb / cadence captions.
    expect(queryByRole('list')).toBeNull();
    expect(queryByText(/per seat/i)).toBeNull();
  });
});

describe('PricingCard — highlighted treatment', () => {
  it('renders the "Most popular" badge by default when highlighted', () => {
    const { getByText } = render(<PricingCard highlighted name="Team" price="$12" />);
    expect(getByText('Most popular')).toBeInTheDocument();
  });

  it('renders a custom highlight label when provided', () => {
    const { getByText, queryByText } = render(
      <PricingCard highlighted highlightLabel="Recommended" name="Team" price="$12" />,
    );
    expect(getByText('Recommended')).toBeInTheDocument();
    expect(queryByText('Most popular')).toBeNull();
  });

  it('suppresses the badge when highlightLabel is null but keeps the elevated/selected ring', () => {
    const { container, queryByText } = render(
      <PricingCard highlighted highlightLabel={null} name="Team" price="$12" />,
    );

    expect(queryByText('Most popular')).toBeNull();

    const card = container.querySelector('[data-selected="true"]');
    expect(card).not.toBeNull();
  });

  it('does NOT mark the card selected when highlighted is false', () => {
    const { container } = render(<PricingCard name="Team" price="$12" />);
    const card = container.querySelector('[data-selected="true"]');
    expect(card).toBeNull();
  });
});

describe('PricingCard — accessibility', () => {
  it('has no axe violations for a fully-populated card', async () => {
    const { container } = render(
      <PricingCard
        name="Team"
        price="$12"
        cadence="per seat / month, billed yearly"
        blurb="Growing teams that need richer collaboration."
        features={['Unlimited collaborators', 'SSO', '90-day audit log']}
        cta={<Button>Start trial</Button>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations for the highlighted variant', async () => {
    const { container } = render(
      <PricingCard
        highlighted
        name="Team"
        price="$12"
        cadence="per seat / month"
        features={['Everything in Starter', 'Advanced analytics']}
        cta={<Button>Start trial</Button>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('marks the bullet icons aria-hidden so screen readers skip them', () => {
    const { getAllByRole } = render(
      <PricingCard
        name="Free"
        price="$0"
        features={['One', 'Two']}
        cta={<Button>Get</Button>}
      />,
    );

    const items = getAllByRole('listitem');
    items.forEach((item) => {
      const bullet = item.querySelector('[aria-hidden="true"]');
      expect(bullet).not.toBeNull();
    });
  });
});