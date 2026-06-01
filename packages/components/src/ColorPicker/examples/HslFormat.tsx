import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function HslFormat() {
  const [color, setColor] = useState('hsl(248, 73%, 63%)');
  return <ColorPicker value={color} format="hsl" onChange={setColor} ariaLabel="HSL color" />;
}