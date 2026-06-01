import { Div, Icon } from '@apx-ui/ds';

import { ChevronRight } from './_glyphs';

const FLIPS = ['none', 'horizontal', 'vertical', 'both'] as const;

export default function Flip() {
  return (
    <Div display="flex" gap="4" alignItems="center">
      {FLIPS.map((f) => (
        <Div key={f} display="flex" flexDirection="column" alignItems="center" gap="1">
          <Icon as={ChevronRight} size="lg" flip={f} />
          <small>{f}</small>
        </Div>
      ))}
    </Div>
  );
}