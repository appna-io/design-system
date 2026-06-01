import { Div, NumberInput, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<NumberInput />` — labeled fields with steppers,
 * min/max constraints, and varied step sizes.
 */
export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-xs">
      <Div display="flex" flexDirection="column" gap="1.5">
        <label htmlFor="overview-qty" className="text-sm font-medium text-fg-default">
          Quantity
        </label>
        <NumberInput id="overview-qty" defaultValue={3} min={1} max={99} step={1} />
        <Typography variant="caption" color="fg.muted">
          Between 1 and 99 units.
        </Typography>
      </Div>
      <NumberInput aria-label="Percentage" defaultValue={75} min={0} max={100} step={5} />
      <NumberInput
        aria-label="Price"
        defaultValue={24.99}
        min={0}
        max={999}
        step={0.01}
        precision={2}
      />
      <NumberInput aria-label="Temperature °C" defaultValue={-5} min={-40} max={50} step={0.5} />
    </Div>
  );
}