import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

export default function RgbFormat() {
  const [color, setColor] = useState('rgb(108, 92, 231)');
  return <ColorPicker value={color} format="rgb" onChange={setColor} ariaLabel="RGB color" />;
}
