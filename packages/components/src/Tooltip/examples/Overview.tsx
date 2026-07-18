import { Button, Div, Tooltip } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" justifyContent="center" gap="4" className="py-8">
      <Tooltip content="Save changes" placement="top" openDelay={100}>
        <Button variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="View details" placement="right" openDelay={100}>
        <Button variant="outline">Right</Button>
      </Tooltip>
      <Tooltip content="More options" placement="bottom" openDelay={100}>
        <Button variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Go back" placement="left" openDelay={100}>
        <Button variant="outline">Left</Button>
      </Tooltip>
    </Div>
  );
}