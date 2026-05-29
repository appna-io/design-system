import { Button } from 'apx-ds';

export default function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled primary</Button>
      <Button disabled color="danger">
        Disabled danger
      </Button>
      <Button disabled loading>
        Disabled + loading
      </Button>
    </div>
  );
}
