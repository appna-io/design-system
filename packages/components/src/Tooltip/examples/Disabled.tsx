import { Button, Tooltip } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip content="This won't show" disabled>
        <Button variant="soft">Disabled tooltip</Button>
      </Tooltip>
      <Tooltip content="This shows">
        <Button variant="soft">Enabled tooltip</Button>
      </Tooltip>
    </div>
  );
}
