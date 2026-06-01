import { Button, Divider, Div } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <Div display="flex" alignItems="center" gap="3" className="h-10 text-sm">
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
    </Div>
  );
}