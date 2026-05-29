import { Button, Stack, Toolbar } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Stack gap={6}>
      <div>
        <p className="mb-2 text-sm text-fg-muted">default</p>
        <Toolbar aria-label="Default toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </div>

      <div>
        <p className="mb-2 text-sm text-fg-muted">bordered</p>
        <Toolbar variant="bordered" aria-label="Bordered toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </div>

      <div>
        <p className="mb-2 text-sm text-fg-muted">floating</p>
        <Toolbar variant="floating" aria-label="Floating toolbar">
          <Button variant="ghost">One</Button>
          <Button variant="ghost">Two</Button>
          <Button variant="ghost">Three</Button>
        </Toolbar>
      </div>
    </Stack>
  );
}
