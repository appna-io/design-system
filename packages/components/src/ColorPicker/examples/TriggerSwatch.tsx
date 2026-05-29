import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function TriggerSwatch() {
  const [color, setColor] = useState('#FF6B6B');
  return <ColorPicker value={color} triggerVariant="swatch" onChange={setColor} ariaLabel="Pick color" />;
}
