import { Div, Icon } from '@apx-ui/ds';

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
    <Div display="flex" gap="4" className="flex-wrap">
      {COLORS.map((c) => (
        <Div key={c} display="flex" flexDirection="column" alignItems="center" gap="1">
          <Icon as={Heart} size="lg" color={c} />
          <small>{c}</small>
        </Div>
      ))}
      <Div display="flex" flexDirection="column" alignItems="center" gap="1">
        <Icon as={Heart} size="lg" color="#ec4899" />
        <small>#ec4899</small>
      </Div>
    </Div>
  );
}