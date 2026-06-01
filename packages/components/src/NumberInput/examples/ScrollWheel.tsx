import { Div, NumberInput, Typography } from '@apx-ui/ds';

export default function ScrollWheel() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <NumberInput
        aria-label="Scroll-wheel enabled"
        defaultValue={50}
        min={0}
        max={100}
        step={1}
        enableScrollWheel
      />
      <Typography variant="caption" color="fg.muted">
        Click into the input, then scroll the mouse wheel up/down to step. Wheel is ignored when
        the input is not focused so accidental page scrolls do not change the value.
      </Typography>
    </Div>
  );
}