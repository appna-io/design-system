import { Radio, RadioGroup } from '@apx-ui/ds';

export default function WithDescription() {
  return (
    <RadioGroup name="plan" defaultValue="pro" aria-label="Subscription tier">
      <Radio value="free" description="Up to 3 projects, community support.">
        Free
      </Radio>
      <Radio value="pro" description="Unlimited projects + priority support.">
        Pro
      </Radio>
      <Radio
        value="team"
        description="Shared workspaces and per-seat billing. Best for growing teams."
      >
        Team
      </Radio>
    </RadioGroup>
  );
}