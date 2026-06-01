import { Alert } from '@apx-ui/ds';

export default function HideIcon() {
  return (
    <Alert color="neutral" hideIcon>
      <Alert.Description>Chrome-less alert — useful for dense forms.</Alert.Description>
    </Alert>
  );
}