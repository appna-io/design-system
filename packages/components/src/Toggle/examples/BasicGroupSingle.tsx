import { useState } from 'react';
import { ToggleGroup } from 'apx-ds';

export default function BasicGroupSingle() {
  const [view, setView] = useState('grid');
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        aria-label="View mode"
        value={view}
        onValueChange={setView}
      >
        <ToggleGroup.Item value="grid" aria-label="Grid">Grid</ToggleGroup.Item>
        <ToggleGroup.Item value="list" aria-label="List">List</ToggleGroup.Item>
        <ToggleGroup.Item value="kanban" aria-label="Kanban">Kanban</ToggleGroup.Item>
      </ToggleGroup>
      <span className="text-sm text-fg-muted">Active view: {view || '(none)'}</span>
    </div>
  );
}
