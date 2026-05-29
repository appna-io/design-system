import { useState } from 'react';
import { Rating } from '@apx-ui/ds';

export default function AllowClear() {
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Rating value={value} onChange={(next) => setValue(next)} allowClear ariaLabel="Clearable rating" />
      <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
        Click the current value (or press <kbd>Home</kbd>) to clear. Value: <strong>{value}</strong>
      </span>
    </div>
  );
}
