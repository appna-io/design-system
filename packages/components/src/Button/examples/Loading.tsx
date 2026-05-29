import { useState } from 'react';
import { Button } from 'apx-ds';

export default function Loading() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading>Submitting…</Button>
      <Button loading loadingText="Saving…" color="success">
        Save
      </Button>
      <Button
        loading={busy}
        onClick={() => {
          setBusy(true);
          setTimeout(() => setBusy(false), 1500);
        }}
      >
        {busy ? 'Working' : 'Trigger 1.5s load'}
      </Button>
    </div>
  );
}
