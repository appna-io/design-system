import { Divider } from 'apx-ds';

export default function Variant() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Solid</p>
        <Divider variant="solid" />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Dashed</p>
        <Divider variant="dashed" />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Dotted</p>
        <Divider variant="dotted" />
      </div>
    </div>
  );
}
