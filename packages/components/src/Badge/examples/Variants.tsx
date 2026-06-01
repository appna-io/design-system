import { Badge, Div } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="subtle">Subtle</Badge>
    </Div>
  );
}