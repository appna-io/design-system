import { useState } from 'react';
import { ColorPicker } from '@apx-ui/ds';

const PALETTE = [
  '#000000',
  '#FFFFFF',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#84CC16',
  '#F97316',
];

export default function WithPresets() {
  const [color, setColor] = useState('#6366F1');
  return (
    <ColorPicker
      value={color}
      presets={PALETTE}
      onChange={setColor}
      ariaLabel="Color with presets"
    />
  );
}