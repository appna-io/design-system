import { Input } from 'apx-ds';

export default function Variants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input variant="outline" placeholder="Outline" aria-label="Outline variant" />
      <Input variant="solid" placeholder="Solid" aria-label="Solid variant" />
      <Input variant="ghost" placeholder="Ghost" aria-label="Ghost variant" />
      <Input variant="underline" placeholder="Underline" aria-label="Underline variant" />
    </div>
  );
}
