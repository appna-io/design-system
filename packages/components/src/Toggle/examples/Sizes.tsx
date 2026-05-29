import { ToggleGroup } from '@apx-ui/ds';

const SIZES = ['sm', 'md', 'lg'] as const;

export default function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-10 text-xs font-medium text-fg-muted uppercase">{size}</span>
          <ToggleGroup
            type="single"
            aria-label={`${size} group`}
            defaultValue="b"
            size={size}
            variant="outline"
          >
            <ToggleGroup.Item value="a" aria-label="A">A</ToggleGroup.Item>
            <ToggleGroup.Item value="b" aria-label="B">B</ToggleGroup.Item>
            <ToggleGroup.Item value="c" aria-label="C">C</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}
