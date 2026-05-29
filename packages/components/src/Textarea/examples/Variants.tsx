import { Textarea } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Textarea variant="outline" placeholder="Outline" aria-label="Outline variant" />
      <Textarea variant="solid" placeholder="Solid" aria-label="Solid variant" />
      <Textarea variant="ghost" placeholder="Ghost" aria-label="Ghost variant" />
      <Textarea variant="underline" placeholder="Underline" aria-label="Underline variant" />
    </div>
  );
}
