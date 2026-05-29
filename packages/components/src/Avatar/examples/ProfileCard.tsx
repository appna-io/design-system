import { Avatar } from '@apx-ui/ds';

export default function ProfileCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-paper p-4 shadow-sm">
      <Avatar
        size="lg"
        name="Ada Lovelace"
        status="online"
        ring="primary"
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop"
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-fg-default">Ada Lovelace</span>
        <span className="text-xs text-fg-muted">Staff Engineer · Mathematics</span>
      </div>
    </div>
  );
}
