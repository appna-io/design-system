import { useState } from 'react';
import { Div, Input } from '@apx-ui/ds';

export default function Loading() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
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
    </Div>
  );
}