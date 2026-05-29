import { Spinner } from 'apx-ds';

export default function Inline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
        <Spinner size="sm" /> Loading content inline with text…
      </p>
      <p style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
        <Spinner size="sm" /> Spinner inherits the surrounding text color (currentColor fallback)
      </p>
    </div>
  );
}
