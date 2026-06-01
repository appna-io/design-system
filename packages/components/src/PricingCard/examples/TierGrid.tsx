import { Button, Div, PricingCard } from '@apx-ui/ds';

const tiers = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever, up to 5 seats',
    blurb: 'Everything you need to evaluate the product on a small team.',
    cta: 'Get started',
    features: [
      'Unlimited projects',
      'Up to 5 collaborators',
      'Community support',
      '7-day audit log',
    ],
  },
  {
    name: 'Team',
    price: '$12',
    cadence: 'per seat / month, billed yearly',
    blurb: 'For growing teams that need richer collaboration & analytics.',
    cta: 'Start 14-day trial',
    highlighted: true,
    features: [
      'Everything in Starter',
      'Unlimited collaborators',
      'Advanced analytics dashboards',
      '90-day audit log + SSO',
      'Priority email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'tailored to your org',
    blurb: 'Procurement, security, and scale that hold up in regulated industries.',
    cta: 'Talk to sales',
    features: [
      'Everything in Team',
      'SAML SSO + SCIM',
      'Dedicated success manager',
      'Custom DPA, BAA & MSA',
      'Self-hosted regional deployment',
    ],
  },
] as const;

export default function TierGrid() {
  return (
    <Div className="grid gap-5 md:grid-cols-3">
      {tiers.map((tier) => (
        <PricingCard
          key={tier.name}
          name={tier.name}
          price={tier.price}
          cadence={tier.cadence}
          blurb={tier.blurb}
          features={tier.features}
          highlighted={'highlighted' in tier ? tier.highlighted : undefined}
          cta={
            <Button
              fullWidth
              variant={'highlighted' in tier && tier.highlighted ? 'solid' : 'outline'}
              color="primary"
            >
              {tier.cta}
            </Button>
          }
        />
      ))}
    </Div>
  );
}