import { Spinner } from 'apx-ds';

export default function Speeds() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner speed="slow" size="lg" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>slow (1200ms)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner speed="normal" size="lg" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>normal (800ms)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner speed="fast" size="lg" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>fast (500ms)</span>
      </div>
    </div>
  );
}
