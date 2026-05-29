import { useState } from 'react';
import { Rating } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Rating value={value} onChange={(next) => setValue(next)} ariaLabel="Controlled rating" />
      <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
        Current value: <strong>{value}</strong>
      </span>
    </div>
  );
}
