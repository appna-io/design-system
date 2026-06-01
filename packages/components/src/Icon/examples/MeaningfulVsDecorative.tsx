import { Div, Icon, Typography } from '@apx-ui/ds';

import { Mail } from './_glyphs';

export default function MeaningfulVsDecorative() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon as={Mail} /> Inbox
      </button>
      <Typography as="span" variant="bodySmall">
        Decorative (aria-hidden) — paired with visible text
      </Typography>

      <button type="button" aria-label="Inbox">
        <Icon as={Mail} />
      </button>
      <Typography as="span" variant="bodySmall">
        Decorative with aria-label on the button
      </Typography>

      <Icon as={Mail} label="Inbox" />
      <Typography as="span" variant="bodySmall">
        Meaningful via label — role=&quot;img&quot; + aria-label
      </Typography>
    </Div>
  );
}