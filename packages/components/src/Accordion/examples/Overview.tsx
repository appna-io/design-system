import { CreditCard, HelpCircle, Package, ShieldCheck } from 'lucide-react';
import { Accordion } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Accordion />` — a polished settings-style disclosure list with
 * leading icons, single-open mode, and collapsible sections.
 */
export default function Overview() {
  return (
    <Accordion type="single" defaultValue="billing" variant="outline">
      <Accordion.Item value="billing">
        <Accordion.Trigger leftIcon={<CreditCard className="size-4" />}>
          Billing & invoices
        </Accordion.Trigger>
        <Accordion.Content>
          View past invoices, update your payment method, or switch between monthly and annual
          billing.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="shipping">
        <Accordion.Trigger leftIcon={<Package className="size-4" />}>
          Shipping addresses
        </Accordion.Trigger>
        <Accordion.Content>
          Manage delivery addresses for home, office, and gift orders. Default address is used at
          checkout.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="security">
        <Accordion.Trigger leftIcon={<ShieldCheck className="size-4" />}>
          Security & sign-in
        </Accordion.Trigger>
        <Accordion.Content>
          Enable two-factor authentication, review active sessions, and rotate your API keys.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="support">
        <Accordion.Trigger leftIcon={<HelpCircle className="size-4" />}>
          Help & support
        </Accordion.Trigger>
        <Accordion.Content>
          Browse the knowledge base, open a ticket, or schedule a call with our support team.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}