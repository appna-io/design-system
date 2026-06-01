import { Div, Switch, Typography } from '@apx-ui/ds';

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
    <Div
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="4"
      className="border-b border-border py-3 last:border-b-0"
    >
      <Div display="flex" alignItems="flex-start" gap="3" className="min-w-0">
        <Div className="mt-0.5 shrink-0">{icon}</Div>
        <Div display="flex" flexDirection="column" className="min-w-0">
          <Typography as="span" variant="bodySmall" weight="medium" className="truncate">
            {title}
          </Typography>
          <Typography as="span" variant="caption" color="fg.muted">
            {description}
          </Typography>
        </Div>
      </Div>
      <Switch aria-label={title} defaultChecked={defaultChecked} />
    </Div>
  );
}

export default function SettingsRowExample() {
  return (
    <Div className="max-w-md rounded-lg border border-border bg-bg-paper px-4">
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
    </Div>
  );
}