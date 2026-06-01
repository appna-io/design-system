import { Divider, Div, Typography } from '@apx-ui/ds';

export default function Thickness() {
  return (
    <Div className="space-y-6">
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">1px (default)</Typography>
        <Divider thickness={1} />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">2px</Typography>
        <Divider thickness={2} />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">4px</Typography>
        <Divider thickness={4} />
      </Div>
    </Div>
  );
}