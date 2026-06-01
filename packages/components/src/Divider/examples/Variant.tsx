import { Divider, Div, Typography } from '@apx-ui/ds';

export default function Variant() {
  return (
    <Div className="space-y-6">
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Solid</Typography>
        <Divider variant="solid" />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Dashed</Typography>
        <Divider variant="dashed" />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">Dotted</Typography>
        <Divider variant="dotted" />
      </Div>
    </Div>
  );
}