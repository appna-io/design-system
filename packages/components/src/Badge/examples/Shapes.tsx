import { Badge } from '@apx-ui/ds';

export default function Shapes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge shape="rounded">Rounded</Badge>
      <Badge shape="pill">Pill</Badge>
      <Badge shape="square">Square</Badge>
    </div>
  );
}
