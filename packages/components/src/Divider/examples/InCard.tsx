import { Card, Divider, Div, Typography } from '@apx-ui/ds';

export default function InCard() {
  return (
    <Card>
      <Div className="p-4">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Account
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" className="mt-1">
          Manage personal details.
        </Typography>
      </Div>
      <Divider />
      <Div className="p-4">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Security
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" className="mt-1">
          Passwords and two-factor.
        </Typography>
      </Div>
      <Divider />
      <Div className="p-4">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Notifications
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" className="mt-1">
          Email and push preferences.
        </Typography>
      </Div>
    </Card>
  );
}