import { ToggleGroup } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">Stacked</span>
        <ToggleGroup
          type="single"
          aria-label="Density"
          orientation="vertical"
          defaultValue="comfortable"
        >
          <ToggleGroup.Item value="compact" aria-label="Compact">Compact</ToggleGroup.Item>
          <ToggleGroup.Item value="comfortable" aria-label="Comfortable">Comfortable</ToggleGroup.Item>
          <ToggleGroup.Item value="spacious" aria-label="Spacious">Spacious</ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">Stacked + attached</span>
        <ToggleGroup
          type="single"
          aria-label="Density attached"
          orientation="vertical"
          attached
          variant="outline"
          defaultValue="comfortable"
        >
          <ToggleGroup.Item value="compact" aria-label="Compact">Compact</ToggleGroup.Item>
          <ToggleGroup.Item value="comfortable" aria-label="Comfortable">Comfortable</ToggleGroup.Item>
          <ToggleGroup.Item value="spacious" aria-label="Spacious">Spacious</ToggleGroup.Item>
        </ToggleGroup>
      </div>
    </div>
  );
}
