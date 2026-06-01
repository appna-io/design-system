import { useState } from 'react';
import { Button, Toolbar, ToggleGroup } from '@apx-ui/ds';

export default function BasicEditor() {
  const [style, setStyle] = useState<string[]>(['bold']);
  const [align, setAlign] = useState<string>('left');

  return (
    <Toolbar aria-label="Text formatting" variant="bordered">
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
        <ToggleGroup.Item value="underline" aria-label="Underline">
          <u>U</u>
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
        <ToggleGroup.Item value="left" aria-label="Left">
          ⇤
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Center">
          ↔
        </ToggleGroup.Item>
        <ToggleGroup.Item value="right" aria-label="Right">
          ⇥
        </ToggleGroup.Item>
      </ToggleGroup>

      <Toolbar.Separator />

      <Button variant="ghost" aria-label="Link">
        🔗
      </Button>
      <Button variant="ghost" aria-label="Image">
        🖼
      </Button>

      <Toolbar.Spacer />

      <Button variant="solid" color="primary">
        Publish
      </Button>
    </Toolbar>
  );
}