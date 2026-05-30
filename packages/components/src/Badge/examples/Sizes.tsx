import { Badge, Div } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </Div>
  );
}
