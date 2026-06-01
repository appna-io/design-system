import { useState } from 'react';
import { ColorPicker, Div, Typography } from '@apx-ui/ds';

export default function WithAlpha() {
  const [color, setColor] = useState('rgba(108, 92, 231, 0.5)');
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <ColorPicker value={color} enableAlpha onChange={setColor} ariaLabel="Translucent color" />
      <Typography variant="caption" color="fg.muted">
        <code>{color}</code>
      </Typography>
    </Div>
  );
}