import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <Div display="flex" gap="8">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          Stacked
        </Typography>
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
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          Stacked + attached
        </Typography>
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
      </Div>
    </Div>
  );
}