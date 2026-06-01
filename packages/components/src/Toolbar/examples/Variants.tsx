import { Button, Div, Stack, Toolbar, Typography } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Stack gap={6}>
      <Div>
        <Typography variant="bodySmall" color="fg.muted" className="mb-2">
          default
        </Typography>
        <Toolbar aria-label="Default toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </Div>

      <Div>
        <Typography variant="bodySmall" color="fg.muted" className="mb-2">
          bordered
        </Typography>
        <Toolbar variant="bordered" aria-label="Bordered toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </Div>

      <Div>
        <Typography variant="bodySmall" color="fg.muted" className="mb-2">
          floating
        </Typography>
        <Toolbar variant="floating" aria-label="Floating toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </Div>
    </Stack>
  );
}