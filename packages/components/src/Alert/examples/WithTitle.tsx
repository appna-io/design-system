import { Alert } from 'apx-ds';

export default function WithTitle() {
  return (
    <Alert color="success">
      <Alert.Title>Saved successfully</Alert.Title>
      <Alert.Description>Your draft was saved to the cloud at 3:42 PM.</Alert.Description>
    </Alert>
  );
}
