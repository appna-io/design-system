import { Button, Divider } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <div className="flex h-10 items-center gap-3 text-sm">
      <Button variant="ghost" size="sm">
        Cut
      </Button>
      <Button variant="ghost" size="sm">
        Copy
      </Button>
      <Divider orientation="vertical" />
      <Button variant="ghost" size="sm">
        Paste
      </Button>
    </div>
  );
}
