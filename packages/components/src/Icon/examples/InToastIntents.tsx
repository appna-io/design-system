import { Button, Icon, toast } from 'apx-ds';

import { AlertTriangle, Check, Info, X } from './_glyphs';

export default function InToastIntents() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button
        onClick={() => toast.success({ title: 'Saved', icon: <Icon as={Check} /> })}
      >
        Success
      </Button>
      <Button
        onClick={() => toast.info({ title: 'Heads up', icon: <Icon as={Info} /> })}
      >
        Info
      </Button>
      <Button
        onClick={() => toast.warning({ title: 'Watch out', icon: <Icon as={AlertTriangle} /> })}
      >
        Warning
      </Button>
      <Button
        onClick={() => toast.error({ title: 'Failed', icon: <Icon as={X} /> })}
      >
        Error
      </Button>
    </div>
  );
}
