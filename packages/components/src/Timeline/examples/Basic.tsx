import { Timeline } from '@apx-ui/ds';

const now = Date.now();
const day = 86_400_000;

export default function Basic() {
  return (
    <Timeline
      items={[
        {
          id: '1',
          title: 'Initial commit',
          description: 'Repository created and base files added.',
          timestamp: new Date(now - 14 * day),
        },
        {
          id: '2',
          title: 'Merged PR #42',
          description: 'Added authentication flow.',
          timestamp: new Date(now - 7 * day),
          tone: 'success',
        },
        {
          id: '3',
          title: 'Build failed',
          description: 'Linter caught 3 issues during CI.',
          timestamp: new Date(now - 2 * day),
          tone: 'danger',
        },
        {
          id: '4',
          title: 'Deployed to staging',
          timestamp: new Date(now - day),
          tone: 'success',
          active: true,
        },
      ]}
    />
  );
}