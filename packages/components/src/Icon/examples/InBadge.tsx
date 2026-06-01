import { Badge, Div, Icon } from '@apx-ui/ds';

import { Check, Info, X } from './_glyphs';

export default function InBadge() {
  return (
    <Div display="flex" gap="3" alignItems="center">
      <Badge color="success">
        <Icon as={Check} size="xs" /> Approved
      </Badge>
      <Badge color="danger">
        <Icon as={X} size="xs" /> Rejected
      </Badge>
      <Badge color="info">
        <Icon as={Info} size="xs" /> Pending
      </Badge>
    </Div>
  );
}