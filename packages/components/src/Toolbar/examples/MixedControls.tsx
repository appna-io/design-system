import { useState } from 'react';
import { Button, Input, Toolbar, ToggleGroup } from '@apx-ui/ds';

export default function MixedControls() {
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<string>('list');

  return (
    <Toolbar variant="bordered" aria-label="Library">
      <Input
        size="sm"
        placeholder="Search…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Search library"
        className="w-44"
      />

      <Toolbar.Separator />

      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(v) => setView(v as string)}
        attached
        aria-label="View mode"
      >
        <ToggleGroup.Item value="list" aria-label="List view">
          ≣
        </ToggleGroup.Item>
        <ToggleGroup.Item value="grid" aria-label="Grid view">
          ▦
        </ToggleGroup.Item>
        <ToggleGroup.Item value="gallery" aria-label="Gallery view">
          ▤
        </ToggleGroup.Item>
      </ToggleGroup>

      <Toolbar.Spacer />

      <Button variant="solid" color="primary">
        Add item
      </Button>
    </Toolbar>
  );
}