import { Badge, Div } from '@apx-ui/ds';

export default function Shapes() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Badge shape="rounded">Rounded</Badge>
      <Badge shape="pill">Pill</Badge>
      <Badge shape="square">Square</Badge>
    </Div>
  );
}
