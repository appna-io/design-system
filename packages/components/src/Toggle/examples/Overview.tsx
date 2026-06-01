import { AlignCenter, AlignLeft, AlignRight, Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { Div, Toggle, ToggleGroup, Typography } from '@apx-ui/ds';

export default function Overview() {
  const [pinned, setPinned] = useState(true);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState('grid');

  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" alignItems="flex-start" gap="6" className="flex-wrap">
        <Div display="flex" flexDirection="column" alignItems="center" gap="2">
          <Toggle pressed={pinned} onPressedChange={setPinned} variant="outline">
            {pinned ? 'Pinned' : 'Pin'}
          </Toggle>
          <Typography variant="caption" color="fg.muted" align="center">
            Text-only
          </Typography>
        </Div>

        <Div display="flex" flexDirection="column" alignItems="center" gap="2">
          <ToggleGroup type="single" aria-label="Alignment" defaultValue="left" attached variant="outline">
            <ToggleGroup.Item value="left" aria-label="Align left">
              <AlignLeft />
            </ToggleGroup.Item>
            <ToggleGroup.Item value="center" aria-label="Align center">
              <AlignCenter />
            </ToggleGroup.Item>
            <ToggleGroup.Item value="right" aria-label="Align right">
              <AlignRight />
            </ToggleGroup.Item>
          </ToggleGroup>
          <Typography variant="caption" color="fg.muted" align="center">
            Icon-only group
          </Typography>
        </Div>

        <Div display="flex" flexDirection="column" alignItems="center" gap="2">
          <Toggle
            pressed={muted}
            onPressedChange={setMuted}
            variant="outline"
            color="warning"
            aria-label={muted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {muted ? <BellOff /> : <Bell />}
            <Typography as="span" variant="bodySmall">
              {muted ? 'Muted' : 'Notifications'}
            </Typography>
          </Toggle>
          <Typography variant="caption" color="fg.muted" align="center">
            Icon + label
          </Typography>
        </Div>

        <Div display="flex" flexDirection="column" alignItems="center" gap="2">
          <ToggleGroup
            type="single"
            aria-label="View mode"
            value={view}
            onValueChange={setView}
            attached
            color="primary"
          >
            <ToggleGroup.Item value="grid" aria-label="Grid">
              Grid
            </ToggleGroup.Item>
            <ToggleGroup.Item value="list" aria-label="List">
              List
            </ToggleGroup.Item>
            <ToggleGroup.Item value="kanban" aria-label="Kanban">
              Kanban
            </ToggleGroup.Item>
          </ToggleGroup>
          <Typography variant="caption" color="fg.muted" align="center">
            Single-pick group
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}