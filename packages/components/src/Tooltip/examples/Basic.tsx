import { Button, Div, Tooltip, Typography } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Hover the button (or focus it with Tab) to see the tooltip.
      </Typography>
      <Tooltip content="Saved 3 minutes ago">
        <Button variant="outline">Hover me — Saved</Button>
      </Tooltip>
    </Div>
  );
}