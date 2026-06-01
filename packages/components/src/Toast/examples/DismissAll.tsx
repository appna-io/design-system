import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function DismissAll() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
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
      </Div>
      <Toaster duration={10_000} expand />
    </Div>
  );
}