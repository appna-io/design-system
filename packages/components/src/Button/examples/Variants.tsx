import { Button } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
