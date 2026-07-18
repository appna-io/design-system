import { Button, Div, Tooltip } from '@apx-ui/ds';

export default function Delay() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="4">
      <Tooltip content="Instant" openDelay={0} closeDelay={0}>
        <Button variant="outline">0ms / 0ms</Button>
      </Tooltip>
      <Tooltip content="Defaults" openDelay={400} closeDelay={150}>
        <Button variant="outline">400ms / 150ms</Button>
      </Tooltip>
      <Tooltip content="Patient" openDelay={1000} closeDelay={300}>
        <Button variant="outline">1000ms / 300ms</Button>
      </Tooltip>
    </Div>
  );
}