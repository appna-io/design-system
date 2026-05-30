import { Badge, Div, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-20">
        <Badge variant="soft" color="success" withDot dotPulse>
          Live
        </Badge>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Status
        </Typography>
      </Div>
      
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-20">
        <Badge variant="subtle" color="info">
          12
        </Badge>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Count
        </Typography>
      </Div>
      
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-20">
        <Badge variant="outline" color="primary">
          Beta
        </Badge>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Feature
        </Typography>
      </Div>
      
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-20">
        <Badge variant="soft" color="primary" removable onRemove={() => {}}>
          React
        </Badge>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Removable
        </Typography>
      </Div>
    </Div>
  );
}