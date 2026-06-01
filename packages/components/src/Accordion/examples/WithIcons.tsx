import { Bell, Lock, ShieldCheck } from 'lucide-react';
import { Accordion } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Accordion type="single" defaultValue="notifications">
      <Accordion.Item value="notifications">
        <Accordion.Trigger leftIcon={<Bell className="size-4" />}>Notifications</Accordion.Trigger>
        <Accordion.Content>Manage email, SMS, and in-app notification preferences.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="security">
        <Accordion.Trigger leftIcon={<Lock className="size-4" />}>Security</Accordion.Trigger>
        <Accordion.Content>Two-factor authentication, login history, active sessions.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="privacy">
        <Accordion.Trigger leftIcon={<ShieldCheck className="size-4" />}>Privacy</Accordion.Trigger>
        <Accordion.Content>Data export, account deletion, third-party app access.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}