import { Button, Div, Tooltip } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="4">
      <Tooltip content="This won't show" disabled>
        <Button variant="outline">Disabled tooltip</Button>
      </Tooltip>
      <Tooltip content="This shows">
        <Button variant="outline">Enabled tooltip</Button>
      </Tooltip>
    </Div>
  );
}