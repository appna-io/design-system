import { Icon } from 'apx-ds';

import { Loader } from './_glyphs';

export default function Spin() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon as={Loader} spin label="Loading" />
      <Icon as={Loader} spin size="lg" color="accent" label="Loading large" />
      <span style={{ fontSize: 12, color: 'gray' }}>
        Respects <code>prefers-reduced-motion</code>.
      </span>
    </div>
  );
}
