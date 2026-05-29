import { Icon } from 'apx-ds';

import { ChevronRight } from './_glyphs';

const FLIPS = ['none', 'horizontal', 'vertical', 'both'] as const;

export default function Flip() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {FLIPS.map((f) => (
        <div key={f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon as={ChevronRight} size="lg" flip={f} />
          <small>{f}</small>
        </div>
      ))}
    </div>
  );
}
