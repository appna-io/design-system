import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function Persistent() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Button
        onClick={() =>
          toast('Action required', {
            description: 'This toast will stay until you dismiss it.',
            duration: 0,
            action: {
              label: 'Acknowledge',
              onClick: () => {},
            },
          })
        }
      >
        Fire persistent toast
      </Button>
      <Toaster closeButton />
    </Div>
  );
}