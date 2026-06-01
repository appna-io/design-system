import { Div, NumberInput, Typography } from '@apx-ui/ds';

export default function Step() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput
        aria-label="Step 0.5, Shift+Arrow jumps by 5"
        defaultValue={2.5}
        min={0}
        max={100}
        step={0.5}
        largeStep={5}
      />
      <Typography variant="caption" color="fg.muted">
        Arrow Up/Down steps by 0.5. Hold Shift (or use PageUp/PageDown) to jump by 5. Home → min,
        End → max.
      </Typography>
    </Div>
  );
}