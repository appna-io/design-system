import { Accordion, Div, Typography } from '@apx-ui/ds';

export default function FAQ() {
  return (
    <Div className="mx-auto max-w-2xl">
      <Typography as="h2" variant="h6" weight="semibold" sx={{ mb: 4 }}>
        Frequently asked questions
      </Typography>
      <Accordion type="single" variant="solid">
        <Accordion.Item value="trial">
          <Accordion.Trigger>Is there a free trial?</Accordion.Trigger>
          <Accordion.Content>
            Yes — 14 days, no credit card required. You can upgrade or downgrade at any point.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.Trigger>How does billing work?</Accordion.Trigger>
          <Accordion.Content>
            We bill monthly on the day you subscribe. Annual plans get a 20% discount and one
            month free.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="cancel">
          <Accordion.Trigger>Can I cancel anytime?</Accordion.Trigger>
          <Accordion.Content>
            Yes. Cancel from the billing page; access continues through the end of the current
            billing period.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="support">
          <Accordion.Trigger>What kind of support do you offer?</Accordion.Trigger>
          <Accordion.Content>
            Email support on all plans (24-hour response). Teams plans include a shared Slack
            channel; Enterprise plans include a dedicated solutions engineer.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </Div>
  );
}