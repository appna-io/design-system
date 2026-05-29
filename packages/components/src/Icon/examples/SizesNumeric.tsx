import { Icon } from 'apx-ds';

import { Star } from './_glyphs';

export default function SizesNumeric() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon as={Star} size={12} />
      <Icon as={Star} size={20} />
      <Icon as={Star} size={32} />
      <Icon as={Star} size="2.5rem" />
      <Icon as={Star} size="48px" />
    </div>
  );
}
