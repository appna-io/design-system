import { Input } from 'apx-ds';

export default function Disabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
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
    </div>
  );
}
