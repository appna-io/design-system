import { useState } from 'react';
import { ToggleGroup } from 'apx-ds';

export default function Required() {
  const [view, setView] = useState('grid');
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        aria-label="View mode (required)"
        value={view}
        onValueChange={setView}
        required
        variant="outline"
        color="primary"
      >
        <ToggleGroup.Item value="grid" aria-label="Grid">Grid</ToggleGroup.Item>
        <ToggleGroup.Item value="list" aria-label="List">List</ToggleGroup.Item>
        <ToggleGroup.Item value="kanban" aria-label="Kanban">Kanban</ToggleGroup.Item>
      </ToggleGroup>
      <p className="text-sm text-fg-muted">
        Clicking the active item does nothing — one value is always pressed.
      </p>
      <span className="text-sm text-fg-muted">Active view: {view}</span>
    </div>
  );
}
