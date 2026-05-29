import { ColorSwatch } from 'apx-ds';

const SWATCHES = [
  { value: '#6c5ce7', label: 'Indigo' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Crimson' },
];

export default function ColorSwatchGroup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SWATCHES.map((s) => (
        <ColorSwatch key={s.value} value={s.value} showLabel={s.label} />
      ))}
    </div>
  );
}
