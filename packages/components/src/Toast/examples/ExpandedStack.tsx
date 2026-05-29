import { Button, Toaster, toast } from '@apx-ui/ds';

export default function ExpandedStack() {
  return (
    <div className="space-y-3">
      <Button
        onClick={() => {
          toast('First message');
          setTimeout(() => toast.success('Second message'), 150);
          setTimeout(() => toast.info('Third message'), 300);
        }}
      >
        Fire three toasts
      </Button>
      <p className="text-sm text-fg-muted">
        With <code className="font-mono">expand</code>, the stack always renders expanded
        instead of collapsed-with-hover-to-expand.
      </p>
      <Toaster expand richColors max={5} />
    </div>
  );
}
