import { Button, Toolbar } from 'apx-ds';

export default function Groups() {
  return (
    <Toolbar variant="bordered" aria-label="Document toolbar">
      <Toolbar.Group aria-label="File">
        <Button variant="ghost">New</Button>
        <Button variant="ghost">Open</Button>
        <Button variant="ghost">Save</Button>
      </Toolbar.Group>

      <Toolbar.Separator />

      <Toolbar.Group aria-label="Edit">
        <Button variant="ghost">Cut</Button>
        <Button variant="ghost">Copy</Button>
        <Button variant="ghost">Paste</Button>
      </Toolbar.Group>

      <Toolbar.Separator />

      <Toolbar.Group aria-label="View" gap={2}>
        <Button variant="ghost">Zoom in</Button>
        <Button variant="ghost">Zoom out</Button>
      </Toolbar.Group>
    </Toolbar>
  );
}
