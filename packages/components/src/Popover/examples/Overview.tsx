import { Button, Div, Popover, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo: trigger button with an open popover showing realistic account-menu content.
 */
export default function Overview() {
  return (
    <Popover defaultOpen>
      <Popover.Trigger>
        <Button variant="outline">Account</Button>
      </Popover.Trigger>
      <Popover.Content size="md">
        <Typography variant="bodySmall" weight="medium">
          Maya Singh
        </Typography>
        <Typography variant="caption" color="fg.muted" className="mt-0.5">
          maya@acme.io
        </Typography>
        <Div
          display="flex"
          flexDirection="column"
          gap="1"
          mt="3"
          className="border-t border-border pt-3"
        >
          <Typography variant="bodySmall">Profile settings</Typography>
          <Typography variant="bodySmall">Billing</Typography>
          <Typography variant="bodySmall" color="danger">
            Sign out
          </Typography>
        </Div>
      </Popover.Content>
    </Popover>
  );
}