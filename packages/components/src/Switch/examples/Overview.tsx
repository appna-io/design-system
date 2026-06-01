import { Div, Switch, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Switch aria-label="Airplane mode">Airplane mode</Switch>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Off
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Switch defaultChecked aria-label="Dark mode">
          Dark mode
        </Switch>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          On
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-32">
        <Switch defaultChecked description="Sync changes across all your devices.">
          Enable sync
        </Switch>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          With description
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Switch disabled defaultChecked aria-label="Beta features">
          Beta features
        </Switch>
        <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
          Disabled
        </Typography>
      </Div>
    </Div>
  );
}