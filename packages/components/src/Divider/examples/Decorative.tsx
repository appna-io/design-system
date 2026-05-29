import { Divider } from '@apx-ui/ds';

export default function Decorative() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">
        A decorative divider is hidden from assistive tech (<code className="font-mono">role=&quot;presentation&quot;</code> +
        <code className="font-mono"> aria-hidden=&quot;true&quot;</code>). Use it when a parent region already conveys the
        boundary semantically.
      </p>
      <Divider decorative thickness={2} color="strong" />
    </div>
  );
}
