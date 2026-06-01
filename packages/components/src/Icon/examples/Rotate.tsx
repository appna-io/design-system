import { Div, Icon } from '@apx-ui/ds';

import { ChevronRight } from './_glyphs';

const ROTATIONS = [0, 90, 180, 270] as const;

export default function Rotate() {
  return (
    <Div display="flex" gap="4" alignItems="center">
      {ROTATIONS.map((r) => (
        <Div key={r} display="flex" flexDirection="column" alignItems="center" gap="1">
          <Icon as={ChevronRight} size="lg" rotate={r} />
          <small>{r}°</small>
        </Div>
      ))}
    </Div>
  );
}