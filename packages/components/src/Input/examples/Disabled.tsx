import { Div, Input } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
      <Input
        disabled
        defaultValue="Can't touch this"
        aria-label="Disabled input"
        placeholder="Disabled"
      />
      <Input
        readOnly
        defaultValue="Read-only value"
        aria-label="Read-only input"
        placeholder="Read-only"
      />
    </Div>
  );
}