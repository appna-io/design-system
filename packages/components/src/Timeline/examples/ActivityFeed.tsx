import { Avatar, Timeline, Typography } from '@apx-ui/ds';

const hour = 3_600_000;
const now = Date.now();

const events = [
  {
    id: 'e1',
    actor: { name: 'Maya', avatar: 'https://i.pravatar.cc/40?u=maya' },
    verb: 'opened PR',
    target: '#142 — Add stat tiles',
    at: new Date(now - 45 * 60_000),
    tone: 'info' as const,
  },
  {
    id: 'e2',
    actor: { name: 'Liam', avatar: 'https://i.pravatar.cc/40?u=liam' },
    verb: 'reviewed',
    target: '#142 with 2 comments',
    at: new Date(now - 2 * hour),
    tone: 'neutral' as const,
  },
  {
    id: 'e3',
    actor: { name: 'Ava', avatar: 'https://i.pravatar.cc/40?u=ava' },
    verb: 'merged PR',
    target: '#142 → main',
    at: new Date(now - 6 * hour),
    tone: 'success' as const,
  },
];

export default function ActivityFeed() {
  return (
    <Timeline aria-label="Repository activity feed">
      {events.map((e) => (
        <Timeline.Item
          key={e.id}
          id={e.id}
          tone={e.tone}
          icon={<Avatar src={e.actor.avatar} alt={e.actor.name} size="sm" />}
          timestamp={e.at}
        >
          <Timeline.Title>
            <strong>{e.actor.name}</strong> {e.verb}{' '}
            <Typography as="span" variant="bodySmall" color="fg.muted">
              {e.target}
            </Typography>
          </Timeline.Title>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}