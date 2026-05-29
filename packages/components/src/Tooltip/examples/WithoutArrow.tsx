import { Button, Tooltip } from 'apx-ds';

export default function WithoutArrow() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip content="With arrow" showArrow>
        <Button variant="soft">With arrow</Button>
      </Tooltip>
      <Tooltip content="Without arrow" showArrow={false}>
        <Button variant="soft">No arrow</Button>
      </Tooltip>
    </div>
  );
}
