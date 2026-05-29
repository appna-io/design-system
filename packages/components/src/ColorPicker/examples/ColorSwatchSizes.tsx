import { ColorSwatch } from 'apx-ds';

export default function ColorSwatchSizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ColorSwatch value="#6c5ce7" size="sm" />
      <ColorSwatch value="#6c5ce7" size="md" />
      <ColorSwatch value="#6c5ce7" size="lg" />
    </div>
  );
}
