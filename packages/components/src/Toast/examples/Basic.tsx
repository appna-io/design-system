import { Button, Toaster, toast } from 'apx-ds';

export default function Basic() {
  return (
    <div className="space-y-3">
      <Button onClick={() => toast('Saved.')}>Show toast</Button>
      <p className="text-sm text-fg-muted">
        The Toaster is mounted in this preview, but in real apps it lives once at your app
        shell. <code className="font-mono">toast(&apos;Saved.&apos;)</code> can be called from
        anywhere — components, hooks, plain JS modules.
      </p>
      <Toaster />
    </div>
  );
}
