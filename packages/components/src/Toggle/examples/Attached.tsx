import { ToggleGroup } from '@apx-ui/ds';

export default function Attached() {
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        defaultValue="left"
        attached
        variant="outline"
      >
        <ToggleGroup.Item value="left" aria-label="Align left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Align center">Center</ToggleGroup.Item>
        <ToggleGroup.Item value="right" aria-label="Align right">Right</ToggleGroup.Item>
        <ToggleGroup.Item value="justify" aria-label="Justify">Justify</ToggleGroup.Item>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        aria-label="Pricing period"
        defaultValue="monthly"
        attached
        variant="solid"
        color="primary"
      >
        <ToggleGroup.Item value="monthly" aria-label="Monthly">Monthly</ToggleGroup.Item>
        <ToggleGroup.Item value="yearly" aria-label="Yearly">Yearly</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  );
}
