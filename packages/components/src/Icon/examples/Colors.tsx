import { Icon } from '@apx-ui/ds';

import { Heart } from './_glyphs';

const COLORS = [
  'current',
  'default',
  'muted',
  'subtle',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
] as const;

export default function Colors() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {COLORS.map((c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon as={Heart} size="lg" color={c} />
          <small>{c}</small>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Icon as={Heart} size="lg" color="#ec4899" />
        <small>#ec4899</small>
      </div>
    </div>
  );
}
