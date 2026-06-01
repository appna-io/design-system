import { Button, Div, Toaster, Typography, toast } from '@apx-ui/ds';

export default function ExpandedStack() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Button
        onClick={() => {
          toast('First message');
          setTimeout(() => toast.success('Second message'), 150);
          setTimeout(() => toast.info('Third message'), 300);
        }}
      >
        Fire three toasts
      </Button>
      <Typography variant="bodySmall" color="fg.muted">
        With <code className="font-mono">expand</code>, the stack always renders expanded
        instead of collapsed-with-hover-to-expand.
      </Typography>
      <Toaster expand richColors max={5} />
    </Div>
  );
}