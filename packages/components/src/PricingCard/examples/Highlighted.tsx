import { Button, PricingCard } from '@apx-ui/ds';

export default function Highlighted() {
  return (
    <PricingCard
      highlighted
      name="Team"
      price="$12"
      cadence="per seat / month, billed yearly"
      blurb="For growing teams that need richer collaboration & analytics."
      features={[
        'Everything in Starter',
        'Unlimited collaborators',
        'Advanced analytics dashboards',
        '90-day audit log + SSO',
        'Priority email support',
      ]}
      cta={
        <Button fullWidth variant="solid" color="primary">
          Start 14-day trial
        </Button>
      }
      style={{ maxWidth: 320 }}
    />
  );
}