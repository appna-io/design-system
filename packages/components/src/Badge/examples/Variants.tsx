import { Badge } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="subtle">Subtle</Badge>
    </div>
  );
}
