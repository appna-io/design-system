import { Button, Div, Icon } from '@apx-ui/ds';

import { Check, Mail } from './_glyphs';

export default function InButton() {
  return (
    <Div display="flex" gap="3">
      <Button leadingIcon={<Icon as={Mail} />}>Send</Button>
      <Button color="success" leadingIcon={<Icon as={Check} />}>
        Confirm
      </Button>
      <Button variant="outline" size="sm" trailingIcon={<Icon as={Mail} />}>
        Inbox
      </Button>
    </Div>
  );
}