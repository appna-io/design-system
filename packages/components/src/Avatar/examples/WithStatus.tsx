import { Avatar, Div, Typography, type AvatarStatus, type AvatarStatusPlacement } from '@apx-ui/ds';

const STATUSES: readonly AvatarStatus[] = ['online', 'away', 'busy', 'offline'];
const PLACEMENTS: readonly AvatarStatusPlacement[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export default function WithStatus() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          Status tone (bottom-right)
        </Typography>
        <Div display="flex" flexWrap="wrap" alignItems="center" gap="5">
          {STATUSES.map((status) => (
            <Avatar key={status} name="Ada Lovelace" status={status} label={status} />
          ))}
        </Div>
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" weight="medium" transform="upper" letterSpacing="wide" color="fg.muted">
          Placement (online)
        </Typography>
        <Div display="flex" flexWrap="wrap" alignItems="center" gap="5">
          {PLACEMENTS.slice(0, -1).map((placement) => (
            <Avatar key={placement} name="Ada Lovelace" status="online" statusPlacement={placement} label={placement} />
          ))}
          {/* Keep one with custom Typography to show flexibility */}
          <Div display="flex" flexDirection="column" alignItems="center" gap="1">
            <Avatar name="Ada Lovelace" status="online" statusPlacement="bottom-right" />
            <Typography variant="caption" color="fg.muted" weight="semibold">bottom-right</Typography>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
