import { useState } from 'react';
import { Input } from 'apx-ds';

export default function Loading() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input loading defaultValue="Validating…" aria-label="Async-validating input" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setBusy(true);
          window.setTimeout(() => setBusy(false), 800);
        }}
        loading={busy}
        placeholder="Type to trigger a fake 800ms check"
        aria-label="Live-validating input"
      />
    </div>
  );
}
