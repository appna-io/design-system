import { useState } from 'react';
import { Button, Toolbar, ToggleGroup } from '@apx-ui/ds';

export default function Overview() {
  const [style, setStyle] = useState<string[]>(['bold']);
  const [align, setAlign] = useState('left');

  return (
    <Toolbar aria-label="Document editor" variant="bordered">
      <ToggleGroup
        type="multiple"
        value={style}
        onValueChange={(value) => setStyle(value as string[])}
        attached
        aria-label="Text style"
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

      <Toolbar.Separator />

      <ToggleGroup
        type="single"
        value={align}
        onValueChange={(value) => setAlign(value as string)}
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

      <Button variant="ghost" aria-label="Insert link">
        🔗
      </Button>
      <Button variant="ghost" aria-label="Insert image">
        🖼
      </Button>
      <Button variant="ghost" aria-label="Undo">
        ↩
      </Button>

      <Toolbar.Spacer />

      <Button variant="solid" color="primary">
        Publish
      </Button>
    </Toolbar>
  );
}