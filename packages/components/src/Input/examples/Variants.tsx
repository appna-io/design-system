import { Div, Input } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
      <Input variant="outline" placeholder="Outline" aria-label="Outline variant" />
      <Input variant="solid" placeholder="Solid" aria-label="Solid variant" />
      <Input variant="ghost" placeholder="Ghost" aria-label="Ghost variant" />
      <Input variant="underline" placeholder="Underline" aria-label="Underline variant" />
    </Div>
  );
}