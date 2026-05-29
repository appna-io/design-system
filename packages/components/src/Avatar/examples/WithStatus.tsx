import { Avatar, type AvatarStatus, type AvatarStatusPlacement } from 'apx-ds';

const STATUSES: readonly AvatarStatus[] = ['online', 'away', 'busy', 'offline'];
const PLACEMENTS: readonly AvatarStatusPlacement[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export default function WithStatus() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Status tone (bottom-right)
        </span>
        <div className="flex flex-wrap items-center gap-5">
          {STATUSES.map((status) => (
            <div key={status} className="flex flex-col items-center gap-1">
              <Avatar name="Ada Lovelace" status={status} />
              <span className="text-xs text-fg-muted">{status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Placement (online)
        </span>
        <div className="flex flex-wrap items-center gap-5">
          {PLACEMENTS.map((placement) => (
            <div key={placement} className="flex flex-col items-center gap-1">
              <Avatar name="Ada Lovelace" status="online" statusPlacement={placement} />
              <span className="text-xs text-fg-muted">{placement}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
