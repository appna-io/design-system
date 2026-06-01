import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function WithAction() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
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
    </Div>
  );
}