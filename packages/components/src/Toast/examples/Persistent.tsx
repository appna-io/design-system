import { Button, Toaster, toast } from 'apx-ds';

export default function Persistent() {
  return (
    <div className="space-y-3">
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
    </div>
  );
}
