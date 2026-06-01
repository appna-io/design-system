import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

export default function DisabledItem() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          Per-item disabled
        </Typography>
        <ToggleGroup
          type="single"
          aria-label="Plan tier"
          defaultValue="free"
          attached
          variant="outline"
        >
          <ToggleGroup.Item value="free" aria-label="Free">Free</ToggleGroup.Item>
          <ToggleGroup.Item value="pro" aria-label="Pro">Pro</ToggleGroup.Item>
          <ToggleGroup.Item value="enterprise" aria-label="Enterprise" disabled>
            Enterprise (coming soon)
          </ToggleGroup.Item>
        </ToggleGroup>
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" color="fg.muted">
          Group disabled
        </Typography>
        <ToggleGroup
          type="multiple"
          aria-label="Read-only formatting"
          defaultValue={['bold', 'italic']}
          disabled
        >
          <ToggleGroup.Item value="bold" aria-label="Bold">
            <strong>B</strong>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="italic" aria-label="Italic">
            <em>I</em>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="underline" aria-label="Underline">
            <u>U</u>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Div>
    </Div>
  );
}