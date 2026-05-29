import { Button, Toaster, toast } from '@apx-ui/ds';

export default function RichColors() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
      </div>
      <p className="text-sm text-fg-muted">
        With <code className="font-mono">richColors</code>, every toast adopts the
        <code className="font-mono">soft</code> variant by default \u2014 intent-tinted
        backgrounds for at-a-glance status.
      </p>
      <Toaster richColors />
    </div>
  );
}
