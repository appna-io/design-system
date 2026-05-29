import { Alert } from '@apx-ui/ds';
import { Sparkles } from 'lucide-react';

export default function CustomIcon() {
  return (
    <Alert color="info" icon={<Sparkles />}>
      <Alert.Title>Try the new features</Alert.Title>
      <Alert.Description>
        Override the auto-selected icon via the <code>icon</code> prop.
      </Alert.Description>
    </Alert>
  );
}
