import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function TriggerButton() {
  const [color, setColor] = useState('#4D96FF');
  return (
    <ColorPicker
      value={color}
      triggerVariant="button"
      onChange={setColor}
      ariaLabel="Pick color (button trigger)"
    />
  );
}
