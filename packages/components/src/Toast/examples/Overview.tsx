import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
        <Button color="info" onClick={() => toast.info('A new version is available.')}>
          Info
        </Button>
        <Button color="success" onClick={() => toast.success('Profile updated.')}>
          Success
        </Button>
        <Button color="warning" onClick={() => toast.warning('You have unsaved changes.')}>
          Warning
        </Button>
        <Button color="danger" onClick={() => toast.error('Could not save. Please retry.')}>
          Error
        </Button>
      </Div>
      <Toaster richColors />
    </Div>
  );
}