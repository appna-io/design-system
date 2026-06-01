import { Button, Div, Toaster, Typography, toast } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Button onClick={() => toast('Saved.')}>Show toast</Button>
      <Typography variant="bodySmall" color="fg.muted">
        The Toaster is mounted in this preview, but in real apps it lives once at your app
        shell. <code className="font-mono">toast(&apos;Saved.&apos;)</code> can be called from
        anywhere — components, hooks, plain JS modules.
      </Typography>
      <Toaster />
    </Div>
  );
}