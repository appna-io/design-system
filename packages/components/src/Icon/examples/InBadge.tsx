import { Badge, Icon } from 'apx-ds';

import { Check, Info, X } from './_glyphs';

export default function InBadge() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Badge color="success">
        <Icon as={Check} size="xs" /> Approved
      </Badge>
      <Badge color="danger">
        <Icon as={X} size="xs" /> Rejected
      </Badge>
      <Badge color="info">
        <Icon as={Info} size="xs" /> Pending
      </Badge>
    </div>
  );
}
