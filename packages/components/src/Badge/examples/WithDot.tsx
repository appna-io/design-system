import { Badge } from '@apx-ui/ds';

export default function WithDot() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="soft" color="success" withDot>
        Active
      </Badge>
      <Badge variant="soft" color="warning" withDot>
        Idle
      </Badge>
      <Badge variant="soft" color="danger" withDot dotPulse>
        Live
      </Badge>
      <Badge variant="subtle" color="info" withDot>
        Connected
      </Badge>
    </div>
  );
}
