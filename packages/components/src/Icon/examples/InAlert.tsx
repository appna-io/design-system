import { Alert, Icon } from 'apx-ds';

import { AlertTriangle, Check, Info, X } from './_glyphs';

export default function InAlert() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert color="success" icon={<Icon as={Check} />} title="Saved" />
      <Alert color="info" icon={<Icon as={Info} />} title="Heads up" />
      <Alert color="warning" icon={<Icon as={AlertTriangle} />} title="Watch out" />
      <Alert color="danger" icon={<Icon as={X} />} title="Something went wrong" />
    </div>
  );
}
