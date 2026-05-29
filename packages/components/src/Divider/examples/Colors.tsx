import { Divider } from '@apx-ui/ds';

export default function Colors() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Subtle (default)</p>
        <Divider color="subtle" />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Default</p>
        <Divider color="default" />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-fg-muted">Strong</p>
        <Divider color="strong" />
      </div>
    </div>
  );
}
