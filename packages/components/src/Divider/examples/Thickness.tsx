import { Divider } from 'apx-ds';

export default function Thickness() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">1px (default)</p>
        <Divider thickness={1} />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">2px</p>
        <Divider thickness={2} />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">4px</p>
        <Divider thickness={4} />
      </div>
    </div>
  );
}
