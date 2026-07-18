import { Badge, Div, Typography } from '@apx-ui/ds';

export default function CountAndStatus() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Div display="flex" alignItems="center" gap="4">
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall" weight="medium">
            Inbox
          </Typography>
          <Badge variant="subtle" color="info">
            12
          </Badge>
        </Div>
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall" weight="medium">
            Drafts
          </Typography>
          <Badge variant="subtle" color="neutral">
            3
          </Badge>
        </Div>
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall" weight="medium">
            Archive
          </Typography>
          <Badge variant="subtle" color="neutral">
            128
          </Badge>
        </Div>
      </Div>
      <Div display="flex" alignItems="center" gap="3">
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall">Server</Typography>
          <Badge variant="soft" color="success" withDot dotPulse>
            Online
          </Badge>
        </Div>
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall">Cache</Typography>
          <Badge variant="soft" color="warning" withDot>
            Degraded
          </Badge>
        </Div>
        <Div display="flex" alignItems="center" gap="2">
          <Typography variant="bodySmall">Worker</Typography>
          <Badge variant="soft" color="danger" withDot>
            Offline
          </Badge>
        </Div>
      </Div>
    </Div>
  );
}