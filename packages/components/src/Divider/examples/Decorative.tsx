import { Divider, Div, Typography } from '@apx-ui/ds';

export default function Decorative() {
  return (
    <Div className="space-y-3">
      <Typography variant="bodySmall" color="fg.muted">
        A decorative divider is hidden from assistive tech (<code className="font-mono">role=&quot;presentation&quot;</code> +
        <code className="font-mono"> aria-hidden=&quot;true&quot;</code>). Use it when a parent region already conveys the
        boundary semantically.
      </Typography>
      <Divider decorative thickness={2} color="strong" />
    </Div>
  );
}