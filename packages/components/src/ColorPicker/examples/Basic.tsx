import { useState } from 'react';
import { ColorPicker } from 'apx-ds';

export default function Basic() {
  const [color, setColor] = useState('#6c5ce7');
  return <ColorPicker value={color} onChange={(next) => setColor(next)} ariaLabel="Pick brand color" />;
}
