import { useState } from 'react';
import { Toggle } from '@apx-ui/ds';

export default function BasicToggle() {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Toggle pressed={pinned} onPressedChange={setPinned} aria-label="Pin this conversation">
        {pinned ? 'Pinned' : 'Pin'}
      </Toggle>
      <span className="text-sm text-fg-muted">
        State: {pinned ? 'pressed' : 'released'}
      </span>
    </div>
  );
}
