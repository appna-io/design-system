import { Div, Radio, RadioGroup, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <RadioGroup
        invalid
        required
        aria-label="Shipping speed"
        aria-describedby="shipping-error"
      >
        <Radio value="standard">Standard (5–7 days)</Radio>
        <Radio value="express">Express (2 days)</Radio>
        <Radio value="overnight">Overnight</Radio>
      </RadioGroup>
      <Typography id="shipping-error" variant="caption" color="danger">
        Please choose a shipping speed to continue.
      </Typography>
    </Div>
  );
}