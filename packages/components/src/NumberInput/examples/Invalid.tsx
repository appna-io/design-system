import { Div, NumberInput, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <NumberInput aria-label="Quantity" defaultValue={9999} min={0} max={100} invalid />
      <Typography variant="caption" color="danger">
        Value exceeds the allowed maximum (100).
      </Typography>
    </Div>
  );
}