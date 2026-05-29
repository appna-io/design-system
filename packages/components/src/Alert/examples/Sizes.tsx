import { Alert } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <Alert size="sm" color="info">
        Small — compact padding, smaller icon, tighter type.
      </Alert>
      <Alert size="md" color="info">
        Medium — the default. Balanced for most surfaces.
      </Alert>
      <Alert size="lg" color="info">
        Large — generous padding, larger icon, more breathing room.
      </Alert>
    </div>
  );
}
