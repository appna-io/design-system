import { Avatar, Timeline, Typography } from '@apx-ui/ds';

const hour = 3_600_000;
const now = Date.now();

const events = [
  {
    id: '1',
    actor: { name: 'Maya Singh', avatar: 'https://i.pravatar.cc/40?u=maya' },
    verb: 'commented on',
    target: 'API spec',
    at: new Date(now - 20 * 60_000),
    tone: 'info' as const,
  },
  {
    id: '2',
    actor: { name: 'Liam Cohen', avatar: 'https://i.pravatar.cc/40?u=liam' },
    verb: 'approved',
    target: 'design review',
    at: new Date(now - 2 * hour),
    tone: 'success' as const,
  },
  {
    id: '3',
    actor: { name: 'Ava Goldberg', avatar: 'https://i.pravatar.cc/40?u=ava' },
    verb: 'deployed',
    target: 'v2.4.0 to staging',
    at: new Date(now - 5 * hour),
    tone: 'success' as const,
  },
  {
    id: '4',
    actor: { name: 'Noah Park', avatar: 'https://i.pravatar.cc/40?u=noah' },
    verb: 'flagged',
    target: 'build failure in CI',
    at: new Date(now - 8 * hour),
    tone: 'danger' as const,
    active: true,
  },
];

export default function Overview() {
  return (
    <Timeline aria-label="Team activity">
      {events.map((event) => (
        <Timeline.Item
          key={event.id}
          id={event.id}
          tone={event.tone}
          active={event.active}
          icon={<Avatar src={event.actor.avatar} alt={event.actor.name} size="sm" />}
          timestamp={event.at}
        >
          <Timeline.Title>
            <strong>{event.actor.name}</strong> {event.verb}{' '}
            <Typography as="span" variant="bodySmall" color="fg.muted">
              {event.target}
            </Typography>
          </Timeline.Title>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}