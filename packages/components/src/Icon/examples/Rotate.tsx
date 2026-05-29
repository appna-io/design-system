import { Icon } from '@apx-ui/ds';

import { ChevronRight } from './_glyphs';

const ROTATIONS = [0, 90, 180, 270] as const;

export default function Rotate() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {ROTATIONS.map((r) => (
        <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon as={ChevronRight} size="lg" rotate={r} />
          <small>{r}°</small>
        </div>
      ))}
    </div>
  );
}
