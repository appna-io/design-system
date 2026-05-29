import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { Toggle } from 'apx-ds';

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
      <span>{muted ? 'Notifications muted' : 'Notifications on'}</span>
    </Toggle>
  );
}
