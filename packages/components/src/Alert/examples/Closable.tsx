import { Alert } from '@apx-ui/ds';

export default function Closable() {
  return (
    <Alert closable color="info">
      <Alert.Title>Heads up</Alert.Title>
      <Alert.Description>
        Dismissing this alert animates the height, opacity, and y-offset together — the surrounding
        layout reflows smoothly.
      </Alert.Description>
    </Alert>
  );
}
