import { ToggleGroup } from 'apx-ds';

const VARIANTS = ['solid', 'outline', 'ghost'] as const;

export default function Variants() {
  return (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-20 text-xs font-medium text-fg-muted capitalize">{variant}</span>
          <ToggleGroup
            type="single"
            aria-label={`${variant} group`}
            defaultValue="b"
            variant={variant}
            color="primary"
          >
            <ToggleGroup.Item value="a" aria-label="Option A">A</ToggleGroup.Item>
            <ToggleGroup.Item value="b" aria-label="Option B">B</ToggleGroup.Item>
            <ToggleGroup.Item value="c" aria-label="Option C">C</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}
