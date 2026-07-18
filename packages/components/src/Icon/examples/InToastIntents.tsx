import { Button, Div, Icon, toast } from '@apx-ui/ds';

import { AlertTriangle, Check, Info, X } from './_glyphs';

export default function InToastIntents() {
  return (
    <Div display="flex" gap="2">
      <Button
        onClick={() => toast.success('Saved', { icon: <Icon as={Check} /> })}
      >
        Success
      </Button>
      <Button
        onClick={() => toast.info('Heads up', { icon: <Icon as={Info} /> })}
      >
        Info
      </Button>
      <Button
        onClick={() => toast.warning('Watch out', { icon: <Icon as={AlertTriangle} /> })}
      >
        Warning
      </Button>
      <Button
        onClick={() => toast.error('Failed', { icon: <Icon as={X} /> })}
      >
        Error
      </Button>
    </Div>
  );
}