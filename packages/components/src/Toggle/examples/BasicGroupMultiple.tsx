import { useState } from 'react';
import { ToggleGroup } from 'apx-ds';

export default function BasicGroupMultiple() {
  const [formatting, setFormatting] = useState<string[]>(['bold']);
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="multiple"
        aria-label="Text formatting"
        value={formatting}
        onValueChange={setFormatting}
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
        <ToggleGroup.Item value="strike" aria-label="Strikethrough">
          <span className="line-through">S</span>
        </ToggleGroup.Item>
      </ToggleGroup>
      <span className="text-sm text-fg-muted">
        Active: {formatting.length === 0 ? '(none)' : formatting.join(', ')}
      </span>
    </div>
  );
}
