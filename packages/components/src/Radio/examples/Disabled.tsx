import { Div, Radio, RadioGroup, Typography } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div>
        <Typography variant="bodySmall" weight="medium" className="mb-2">
          Per-radio disabled
        </Typography>
        <RadioGroup defaultValue="a" aria-label="Per-radio disabled">
          <Radio value="a">Available</Radio>
          <Radio value="b" disabled description="Out of stock right now.">
            Backordered
          </Radio>
          <Radio value="c">Available</Radio>
        </RadioGroup>
      </Div>
      <Div>
        <Typography variant="bodySmall" weight="medium" className="mb-2">
          Group-level disabled
        </Typography>
        <RadioGroup disabled defaultValue="a" aria-label="Group disabled">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
          <Radio value="c">Option C</Radio>
        </RadioGroup>
      </Div>
    </Div>
  );
}