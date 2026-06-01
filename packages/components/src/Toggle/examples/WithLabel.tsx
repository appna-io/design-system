import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { Toggle, Typography } from '@apx-ui/ds';

export default function WithLabel() {
  const [muted, setMuted] = useState(false);
  return (
    <Toggle
      pressed={muted}
      onPressedChange={setMuted}
      aria-label={muted ? 'Unmute notifications' : 'Mute notifications'}
      variant="outline"
      color="warning"
    >
      {muted ? <BellOff /> : <Bell />}
      <Typography as="span" variant="bodySmall">
        {muted ? 'Notifications muted' : 'Notifications on'}
      </Typography>
    </Toggle>
  );
}