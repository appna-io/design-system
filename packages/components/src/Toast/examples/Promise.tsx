import { Button, Toaster, toast } from '@apx-ui/ds';

function fakeSave(): Promise<{ title: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({ title: 'Hello, world' });
      } else {
        reject(new Error('Network unavailable'));
      }
    }, 1200);
  });
}

export default function Promise() {
  return (
    <div className="space-y-3">
      <Button
        onClick={() =>
          toast.promise(fakeSave(), {
            loading: 'Saving post\u2026',
            success: (data) => `Posted as "${data.title}"`,
            error: (err) => `Failed: ${(err as Error).message}`,
          })
        }
      >
        Save post (70% success)
      </Button>
      <p className="text-sm text-fg-muted">
        A single toast tracks the entire async lifecycle. The same id is reused so the loading
        toast updates in place to success or error.
      </p>
      <Toaster />
    </div>
  );
}
