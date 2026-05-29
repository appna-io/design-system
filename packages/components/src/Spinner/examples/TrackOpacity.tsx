import { Spinner } from '@apx-ui/ds';

export default function TrackOpacity() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner trackOpacity={0} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>trackOpacity=0 (trackless)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner trackOpacity={0.2} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>trackOpacity=0.2 (default)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner trackOpacity={0.5} size="xl" />
        <span style={{ fontSize: 12, opacity: 0.7 }}>trackOpacity=0.5</span>
      </div>
    </div>
  );
}
