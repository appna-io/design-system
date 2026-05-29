import { Alert, Button } from '@apx-ui/ds';

export default function WithAction() {
  return (
    <Alert color="warning">
      <Alert.Title>Unsaved changes</Alert.Title>
      <Alert.Description>You have edits that haven&apos;t been pushed to the server.</Alert.Description>
      <Alert.Action>
        <Button size="sm" variant="solid" color="warning">
          Save now
        </Button>
        <Button size="sm" variant="ghost" color="warning">
          Discard
        </Button>
      </Alert.Action>
    </Alert>
  );
}
