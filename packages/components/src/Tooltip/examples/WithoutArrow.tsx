import { Button, Div, Tooltip } from '@apx-ui/ds';

export default function WithoutArrow() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="4">
      <Tooltip content="With arrow" showArrow>
        <Button variant="soft">With arrow</Button>
      </Tooltip>
      <Tooltip content="Without arrow" showArrow={false}>
        <Button variant="soft">No arrow</Button>
      </Tooltip>
    </Div>
  );
}