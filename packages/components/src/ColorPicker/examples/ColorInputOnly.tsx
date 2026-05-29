import { useState } from 'react';
import { ColorInput } from '@apx-ui/ds';

export default function ColorInputOnly() {
  const [color, setColor] = useState('#6c5ce7');
  return (
    <ColorInput
      value={color}
      onChange={(next) => setColor(next)}
      format="hex"
      label="Hex code"
      ariaLabel="Hex color value"
    />
  );
}
