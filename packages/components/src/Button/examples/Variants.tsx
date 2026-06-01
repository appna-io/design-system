import { Button, Div } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </Div>
  );
}