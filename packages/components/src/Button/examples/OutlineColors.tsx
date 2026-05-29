import { Button } from 'apx-ds';

export default function OutlineColors() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" color="primary">
        Primary
      </Button>
      <Button variant="outline" color="secondary">
        Secondary
      </Button>
      <Button variant="outline" color="success">
        Success
      </Button>
      <Button variant="outline" color="warning">
        Warning
      </Button>
      <Button variant="outline" color="danger">
        Danger
      </Button>
      <Button variant="outline" color="info">
        Info
      </Button>
      <Button variant="outline" color="neutral">
        Neutral
      </Button>
    </div>
  );
}
