import { useState } from 'react';
import { ColorPicker } from 'apx-ds';

export default function ContrastCheck() {
  const [color, setColor] = useState('#1F2937');
  return (
    <ColorPicker
      value={color}
      enableContrastCheck
      contrastAgainst="#FFFFFF"
      onChange={setColor}
      label="Text color"
      description="Checked against white background"
      ariaLabel="Text color"
    />
  );
}
