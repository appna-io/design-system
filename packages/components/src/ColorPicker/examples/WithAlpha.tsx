import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function WithAlpha() {
  const [color, setColor] = useState('rgba(108, 92, 231, 0.5)');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ColorPicker value={color} enableAlpha onChange={setColor} ariaLabel="Translucent color" />
      <code style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>{color}</code>
    </div>
  );
}
