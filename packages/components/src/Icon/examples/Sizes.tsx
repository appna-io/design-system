import { Icon } from '@apx-ui/ds';

import { Mail } from './_glyphs';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {SIZES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon as={Mail} size={s} />
          <small>{s}</small>
        </div>
      ))}
    </div>
  );
}
