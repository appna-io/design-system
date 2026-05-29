import { ToggleGroup } from '@apx-ui/ds';

export default function DisabledItem() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">Per-item disabled</span>
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
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">Group disabled</span>
        <ToggleGroup
          type="multiple"
          aria-label="Read-only formatting"
          defaultValue={['bold', 'italic']}
          disabled
        >
          <ToggleGroup.Item value="bold" aria-label="Bold">
            <span className="font-bold">B</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="italic" aria-label="Italic">
            <span className="italic">I</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="underline" aria-label="Underline">
            <span className="underline">U</span>
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>
    </div>
  );
}
