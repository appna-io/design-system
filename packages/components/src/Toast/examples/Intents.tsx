import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function Intents() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
        <Button onClick={() => toast('A new comment was posted.')}>Neutral</Button>
        <Button color="success" onClick={() => toast.success('Profile updated.')}>
          Success
        </Button>
        <Button color="danger" onClick={() => toast.error('Could not save. Please retry.')}>
          Error
        </Button>
        <Button color="warning" onClick={() => toast.warning('You have unsaved changes.')}>
          Warning
        </Button>
        <Button color="info" onClick={() => toast.info('A new version is available.')}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.loading('Saving…', { duration: 2500 })}
        >
          Loading
        </Button>
      </Div>
      <Toaster />
    </Div>
  );
}