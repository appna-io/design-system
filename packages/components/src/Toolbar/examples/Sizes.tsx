import { Button, Stack, Toolbar } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Stack gap={4}>
      <Toolbar size="sm" variant="bordered" aria-label="Small toolbar">
        <Button size="sm" variant="ghost">Bold</Button>
        <Button size="sm" variant="ghost">Italic</Button>
        <Button size="sm" variant="ghost">Underline</Button>
      </Toolbar>

      <Toolbar size="md" variant="bordered" aria-label="Medium toolbar">
        <Button size="md" variant="ghost">Bold</Button>
        <Button size="md" variant="ghost">Italic</Button>
        <Button size="md" variant="ghost">Underline</Button>
      </Toolbar>

      <Toolbar size="lg" variant="bordered" aria-label="Large toolbar">
        <Button size="lg" variant="ghost">Bold</Button>
        <Button size="lg" variant="ghost">Italic</Button>
        <Button size="lg" variant="ghost">Underline</Button>
      </Toolbar>
    </Stack>
  );
}
