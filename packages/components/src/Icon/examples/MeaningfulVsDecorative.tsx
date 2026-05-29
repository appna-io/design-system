import { Icon } from '@apx-ui/ds';

import { Mail } from './_glyphs';

export default function MeaningfulVsDecorative() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon as={Mail} /> Inbox
      </button>
      <span>Decorative (aria-hidden) — paired with visible text</span>

      <button type="button" aria-label="Inbox">
        <Icon as={Mail} />
      </button>
      <span>Decorative with aria-label on the button</span>

      <Icon as={Mail} label="Inbox" />
      <span>Meaningful via label — role=&quot;img&quot; + aria-label</span>
    </div>
  );
}
