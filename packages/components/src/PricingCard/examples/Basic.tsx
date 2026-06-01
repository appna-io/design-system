import { Button, PricingCard } from '@apx-ui/ds';

export default function Basic() {
  return (
    <PricingCard
      name="Starter"
      price="$0"
      cadence="forever, up to 5 seats"
      blurb="Everything you need to evaluate the product on a small team."
      features={[
        'Unlimited projects',
        'Up to 5 collaborators',
        'Community support',
        '7-day audit log',
      ]}
      cta={
        <Button fullWidth variant="outline" color="primary">
          Get started
        </Button>
      }
      style={{ maxWidth: 320 }}
    />
  );
}