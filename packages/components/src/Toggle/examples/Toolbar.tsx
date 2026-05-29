import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { useState } from 'react';
import { ToggleGroup } from 'apx-ds';

export default function Toolbar() {
  const [marks, setMarks] = useState<string[]>([]);
  const [align, setAlign] = useState('left');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-bg p-2">
        <ToggleGroup
          type="multiple"
          aria-label="Text marks"
          value={marks}
          onValueChange={setMarks}
          attached
          variant="ghost"
        >
          <ToggleGroup.Item value="bold" aria-label="Bold">
            <Bold />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="italic" aria-label="Italic">
            <Italic />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="underline" aria-label="Underline">
            <Underline />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="strike" aria-label="Strikethrough">
            <Strikethrough />
          </ToggleGroup.Item>
        </ToggleGroup>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <ToggleGroup
          type="single"
          aria-label="Alignment"
          value={align}
          onValueChange={setAlign}
          attached
          variant="ghost"
        >
          <ToggleGroup.Item value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroup.Item>
          <ToggleGroup.Item value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <p
        className="rounded-md border border-border bg-bg-subtle p-3 text-sm"
        style={{
          fontWeight: marks.includes('bold') ? 600 : 400,
          fontStyle: marks.includes('italic') ? 'italic' : 'normal',
          textDecoration: [
            marks.includes('underline') && 'underline',
            marks.includes('strike') && 'line-through',
          ]
            .filter(Boolean)
            .join(' ') || 'none',
          textAlign: align as 'left' | 'center' | 'right',
        }}
      >
        Composed toolbar of two ToggleGroups — multi-select marks plus single-select alignment.
      </p>
    </div>
  );
}
