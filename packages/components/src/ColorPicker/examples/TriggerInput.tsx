import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function TriggerInput() {
  const [color, setColor] = useState('#6BCB77');
  return (
    <ColorPicker
      value={color}
      triggerVariant="input"
      onChange={setColor}
      ariaLabel="Pick color (input-style trigger)"
    />
  );
}
