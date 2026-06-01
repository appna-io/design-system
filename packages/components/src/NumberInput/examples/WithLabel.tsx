import { Div, NumberInput, Typography } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <Div display="flex" flexDirection="column" gap="1.5" className="text-sm">
      <label htmlFor="number-input-with-label" className="font-medium text-fg-default">
        Quantity
      </label>
      <NumberInput id="number-input-with-label" defaultValue={1} min={1} max={99} step={1} />
      <Typography variant="caption" color="fg.muted">
        Between 1 and 99.
      </Typography>
    </Div>
  );
}