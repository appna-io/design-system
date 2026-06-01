import { Div, Slider, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-72">
      <Slider aria-label="Out of range" invalid defaultValue={95} />
      <Typography variant="caption" color="danger">
        Value exceeds the recommended threshold.
      </Typography>
    </Div>
  );
}