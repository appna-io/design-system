import { Bell, CreditCard, KeyRound, User } from 'lucide-react';
import { Tabs } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Tabs defaultValue="profile" aria-label="Account settings">
      <Tabs.List>
        <Tabs.Trigger value="profile" leftIcon={<User aria-hidden="true" />}>
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger value="notifications" leftIcon={<Bell aria-hidden="true" />}>
          Notifications
        </Tabs.Trigger>
        <Tabs.Trigger value="billing" leftIcon={<CreditCard aria-hidden="true" />}>
          Billing
        </Tabs.Trigger>
        <Tabs.Trigger value="api" leftIcon={<KeyRound aria-hidden="true" />}>
          API keys
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="profile">Profile panel content.</Tabs.Panel>
      <Tabs.Panel value="notifications">Notifications panel content.</Tabs.Panel>
      <Tabs.Panel value="billing">Billing panel content.</Tabs.Panel>
      <Tabs.Panel value="api">API keys panel content.</Tabs.Panel>
    </Tabs>
  );
}
