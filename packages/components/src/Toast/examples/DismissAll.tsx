import { Button, Toaster, toast } from '@apx-ui/ds';

export default function DismissAll() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast('First');
            setTimeout(() => toast('Second'), 100);
            setTimeout(() => toast('Third'), 200);
          }}
        >
          Fire three
        </Button>
        <Button variant="outline" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
      <Toaster duration={10_000} expand />
    </div>
  );
}
