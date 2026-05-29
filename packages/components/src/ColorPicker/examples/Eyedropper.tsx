import { useState } from 'react';
import { ColorPicker } from 'apx-ds';

export default function Eyedropper() {
  const [color, setColor] = useState('#6c5ce7');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ColorPicker
        value={color}
        enableEyedropper
        onChange={setColor}
        ariaLabel="Pick from screen"
      />
      <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
        The eyedropper button appears only in browsers that ship `window.EyeDropper` (Chromium).
      </span>
    </div>
  );
}
