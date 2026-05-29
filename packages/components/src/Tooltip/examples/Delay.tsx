import { Button, Tooltip } from 'apx-ds';

export default function Delay() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip content="Instant" openDelay={0} closeDelay={0}>
        <Button variant="soft">0ms / 0ms</Button>
      </Tooltip>
      <Tooltip content="Defaults" openDelay={400} closeDelay={150}>
        <Button variant="soft">400ms / 150ms</Button>
      </Tooltip>
      <Tooltip content="Patient" openDelay={1000} closeDelay={300}>
        <Button variant="soft">1000ms / 300ms</Button>
      </Tooltip>
    </div>
  );
}
