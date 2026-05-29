import { Button } from 'apx-ds';

export default function GhostColors() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" color="primary">
        Primary
      </Button>
      <Button variant="ghost" color="secondary">
        Secondary
      </Button>
      <Button variant="ghost" color="success">
        Success
      </Button>
      <Button variant="ghost" color="warning">
        Warning
      </Button>
      <Button variant="ghost" color="danger">
        Danger
      </Button>
      <Button variant="ghost" color="info">
        Info
      </Button>
      <Button variant="ghost" color="neutral">
        Neutral
      </Button>
    </div>
  );
}
