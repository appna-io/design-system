import { useState } from 'react';
import { ColorPicker } from 'apx-ds';

const BRAND_PALETTE = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#9D4EDD',
  '#FF9F1C',
  '#2EC4B6',
  '#E71D36',
];

export default function PresetsOnly() {
  const [color, setColor] = useState('#4D96FF');
  return (
    <ColorPicker
      value={color}
      presets={BRAND_PALETTE}
      presetsOnly
      closeOnSelect
      onChange={setColor}
      ariaLabel="Brand color"
    />
  );
}
