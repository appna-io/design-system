import { useState } from 'react';
import { ColorPicker } from 'apx-ds';

export default function HexFormat() {
  const [color, setColor] = useState('#FF6B6B');
  return <ColorPicker value={color} format="hex" onChange={setColor} ariaLabel="Hex color" />;
}
