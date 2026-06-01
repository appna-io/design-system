import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

/**
 * Quick-review demo: controlled brand-color picker with label, description, and default trigger.
 */
export default function Overview() {
  const [color, setColor] = useState('#6c5ce7');
  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      label="Brand color"
      description="Used for primary buttons and links"
      ariaLabel="Pick brand color"
    />
  );
}