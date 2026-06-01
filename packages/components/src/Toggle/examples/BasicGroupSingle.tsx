import { useState } from 'react';
import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

export default function BasicGroupSingle() {
  const [view, setView] = useState('grid');
  return (
    <Div display="flex" flexDirection="column" gap="3">
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
      <Typography variant="bodySmall" color="fg.muted">
        Active view: {view || '(none)'}
      </Typography>
    </Div>
  );
}