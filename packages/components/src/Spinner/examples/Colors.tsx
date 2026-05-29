import { Spinner } from 'apx-ds';

const COLORS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const;

export default function Colors() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
      {COLORS.map((color) => (
        <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Spinner color={color} size="lg" />
          <span style={{ fontSize: 12, opacity: 0.7 }}>{color}</span>
        </div>
      ))}
    </div>
  );
}
