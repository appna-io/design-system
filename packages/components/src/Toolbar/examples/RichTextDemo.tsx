import { useState } from 'react';
import { Button, Stack, Toolbar, ToggleGroup } from '@apx-ui/ds';

export default function RichTextDemo() {
  const [style, setStyle] = useState<string[]>([]);
  const [align, setAlign] = useState<string>('left');
  const [list, setList] = useState<string | undefined>(undefined);

  return (
    <Stack gap={3}>
      <Toolbar
        variant="bordered"
        applyTooltips
        aria-label="Rich text editor toolbar"
      >
        <Toolbar.Group aria-label="Headings">
          <Button variant="ghost" aria-label="Heading 1">
            H1
          </Button>
          <Button variant="ghost" aria-label="Heading 2">
            H2
          </Button>
          <Button variant="ghost" aria-label="Heading 3">
            H3
          </Button>
        </Toolbar.Group>

        <Toolbar.Separator />

        <ToggleGroup
          type="multiple"
          value={style}
          onValueChange={(v) => setStyle(v as string[])}
          attached
          aria-label="Text style"
        >
          <ToggleGroup.Item value="bold" aria-label="Bold">
            <strong>B</strong>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="italic" aria-label="Italic">
            <em>I</em>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="strike" aria-label="Strikethrough">
            <s>S</s>
          </ToggleGroup.Item>
        </ToggleGroup>

        <Toolbar.Separator />

        <ToggleGroup
          type="single"
          value={align}
          onValueChange={(v) => setAlign(v as string)}
          attached
          aria-label="Alignment"
        >
          <ToggleGroup.Item value="left" aria-label="Align left">
            ⇤
          </ToggleGroup.Item>
          <ToggleGroup.Item value="center" aria-label="Align center">
            ↔
          </ToggleGroup.Item>
          <ToggleGroup.Item value="right" aria-label="Align right">
            ⇥
          </ToggleGroup.Item>
        </ToggleGroup>

        <Toolbar.Separator />

        <ToggleGroup
          type="single"
          value={list ?? ''}
          onValueChange={(v) => setList((v as string) || undefined)}
          attached
          aria-label="List style"
        >
          <ToggleGroup.Item value="bullet" aria-label="Bulleted list">
            •
          </ToggleGroup.Item>
          <ToggleGroup.Item value="number" aria-label="Numbered list">
            1.
          </ToggleGroup.Item>
        </ToggleGroup>

        <Toolbar.Spacer />

        <Button variant="ghost" aria-label="Undo">
          ↶
        </Button>
        <Button variant="ghost" aria-label="Redo">
          ↷
        </Button>
      </Toolbar>

      <article
        className="prose min-h-[160px] rounded-md border border-border bg-bg-paper p-4"
        style={{
          fontWeight: style.includes('bold') ? 'bold' : 'normal',
          fontStyle: style.includes('italic') ? 'italic' : 'normal',
          textDecoration: style.includes('strike') ? 'line-through' : 'none',
          textAlign: (align as 'left' | 'center' | 'right'),
        }}
      >
        The quick brown fox jumps over the lazy dog. Press a toolbar button to format this
        preview text. Hover an iconic button to see the tooltip enrichment in action.
      </article>
    </Stack>
  );
}