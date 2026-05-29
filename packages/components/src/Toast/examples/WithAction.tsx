import { Button, Toaster, toast } from 'apx-ds';

export default function WithAction() {
  return (
    <div className="space-y-3">
      <Button
        onClick={() =>
          toast('Email moved to Archive', {
            description: 'You can undo this in the next 5 seconds.',
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored.'),
            },
            cancel: {
              label: 'Dismiss',
              onClick: () => {},
            },
          })
        }
      >
        Archive email
      </Button>
      <Toaster closeButton />
    </div>
  );
}
