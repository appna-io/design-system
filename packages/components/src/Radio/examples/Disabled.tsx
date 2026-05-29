import { Radio, RadioGroup } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-medium mb-2">Per-radio disabled</div>
        <RadioGroup defaultValue="a" aria-label="Per-radio disabled">
          <Radio value="a">Available</Radio>
          <Radio value="b" disabled description="Out of stock right now.">
            Backordered
          </Radio>
          <Radio value="c">Available</Radio>
        </RadioGroup>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Group-level disabled</div>
        <RadioGroup disabled defaultValue="a" aria-label="Group disabled">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
          <Radio value="c">Option C</Radio>
        </RadioGroup>
      </div>
    </div>
  );
}
