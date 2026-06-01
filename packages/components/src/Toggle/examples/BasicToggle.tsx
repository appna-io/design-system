import { useState } from 'react';
import { Div, Toggle, Typography } from '@apx-ui/ds';

export default function BasicToggle() {
  const [pinned, setPinned] = useState(false);
  return (
    <Div display="flex" alignItems="center" gap="3">
      <Toggle pressed={pinned} onPressedChange={setPinned} aria-label="Pin this conversation">
        {pinned ? 'Pinned' : 'Pin'}
      </Toggle>
      <Typography variant="bodySmall" color="fg.muted">
        State: {pinned ? 'pressed' : 'released'}
      </Typography>
    </Div>
  );
}