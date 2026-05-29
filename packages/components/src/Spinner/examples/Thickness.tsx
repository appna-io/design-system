import { Spinner } from 'apx-ds';

export default function Thickness() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner thickness={1} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>thickness=1</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner thickness={2} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>thickness=2 (default)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner thickness={3} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>thickness=3</span>
      </div>
    </div>
  );
}
