import { useState } from 'react';
import { ColorPicker, Div, Typography } from '@apx-ui/ds';

export default function Eyedropper() {
  const [color, setColor] = useState('#6c5ce7');
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <ColorPicker
        value={color}
        enableEyedropper
        onChange={setColor}
        ariaLabel="Pick from screen"
      />
      <Typography variant="caption" color="fg.muted">
        The eyedropper button appears only in browsers that ship `window.EyeDropper` (Chromium).
      </Typography>
    </Div>
  );
}