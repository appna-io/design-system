import { Card, Divider } from 'apx-ds';

export default function InCard() {
  return (
    <Card>
      <div className="p-4">
        <h3 className="text-sm font-semibold">Account</h3>
        <p className="mt-1 text-sm text-fg-muted">Manage personal details.</p>
      </div>
      <Divider />
      <div className="p-4">
        <h3 className="text-sm font-semibold">Security</h3>
        <p className="mt-1 text-sm text-fg-muted">Passwords and two-factor.</p>
      </div>
      <Divider />
      <div className="p-4">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <p className="mt-1 text-sm text-fg-muted">Email and push preferences.</p>
      </div>
    </Card>
  );
}
