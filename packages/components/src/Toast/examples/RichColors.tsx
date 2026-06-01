import { Button, Div, Toaster, Typography, toast } from '@apx-ui/ds';

export default function RichColors() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
        <Button onClick={() => toast.success('Profile updated.')}>Success</Button>
        <Button color="danger" onClick={() => toast.error('Could not save.')}>
          Error
        </Button>
        <Button color="warning" onClick={() => toast.warning('Unsaved changes.')}>
          Warning
        </Button>
        <Button color="info" onClick={() => toast.info('New version available.')}>
          Info
        </Button>
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        With <code className="font-mono">richColors</code>, every toast adopts the
        <code className="font-mono">soft</code> variant by default — intent-tinted
        backgrounds for at-a-glance status.
      </Typography>
      <Toaster richColors />
    </Div>
  );
}