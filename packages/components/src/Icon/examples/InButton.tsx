import { Button, Icon } from '@apx-ui/ds';

import { Check, Mail } from './_glyphs';

export default function InButton() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button leadingIcon={<Icon as={Mail} />}>Send</Button>
      <Button color="success" leadingIcon={<Icon as={Check} />}>
        Confirm
      </Button>
      <Button variant="outline" size="sm" trailingIcon={<Icon as={Mail} />}>
        Inbox
      </Button>
    </div>
  );
}
