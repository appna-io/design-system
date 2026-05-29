import { Switch } from 'apx-ds';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-fg-muted">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

interface RowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

function SettingsRow({ icon, title, description, defaultChecked }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{title}</span>
          <span className="text-xs text-fg-muted">{description}</span>
        </div>
      </div>
      <Switch aria-label={title} defaultChecked={defaultChecked} />
    </div>
  );
}

export default function SettingsRowExample() {
  return (
    <div className="rounded-lg border border-border bg-bg-paper px-4 max-w-md">
      <SettingsRow
        icon={<BellIcon />}
        title="Push notifications"
        description="Get notified about replies and mentions."
        defaultChecked
      />
      <SettingsRow
        icon={<BellIcon />}
        title="Sound effects"
        description="Play a sound when a new message arrives."
      />
      <SettingsRow
        icon={<BellIcon />}
        title="Email digest"
        description="Receive a weekly summary every Monday."
        defaultChecked
      />
    </div>
  );
}
