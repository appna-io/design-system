import { Divider, Div, Typography } from '@apx-ui/ds';

export default function Colors() {
  return (
    <Div className="space-y-6">
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Subtle (default)</Typography>
        <Divider color="subtle" />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Default</Typography>
        <Divider color="default" />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Strong</Typography>
        <Divider color="strong" />
      </Div>
    </Div>
  );
}