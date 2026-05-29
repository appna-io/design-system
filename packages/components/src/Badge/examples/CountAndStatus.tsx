import { Badge } from 'apx-ds';

export default function CountAndStatus() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          Inbox
          <Badge variant="subtle" color="info">
            12
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          Drafts
          <Badge variant="subtle" color="neutral">
            3
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          Archive
          <Badge variant="subtle" color="neutral">
            128
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Server</span>
          <Badge variant="soft" color="success" withDot dotPulse>
            Online
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Cache</span>
          <Badge variant="soft" color="warning" withDot>
            Degraded
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Worker</span>
          <Badge variant="soft" color="danger" withDot>
            Offline
          </Badge>
        </div>
      </div>
    </div>
  );
}
