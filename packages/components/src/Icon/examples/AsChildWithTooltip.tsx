import { Icon, Tooltip } from '@apx-ui/ds';

import { Info } from './_glyphs';

export default function AsChildWithTooltip() {
  return (
    <Tooltip content="More information about this field">
      <button type="button" aria-label="More info" style={{ background: 'none', border: 0, cursor: 'pointer' }}>
        <Icon as={Info} size="md" color="muted" />
      </button>
    </Tooltip>
  );
}
