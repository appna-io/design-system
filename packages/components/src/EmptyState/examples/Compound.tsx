import { Button, EmptyState } from '@apx-ui/ds';

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function Compound() {
  return (
    <EmptyState>
      <EmptyState.Icon>
        <TeamIcon />
      </EmptyState.Icon>
      <EmptyState.Title>No users yet</EmptyState.Title>
      <EmptyState.Description>
        Invite your team to <a href="/team" style={{ color: 'inherit', textDecoration: 'underline' }}>collaborate</a> on this project.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button onClick={() => alert('Invite')}>Invite teammates</Button>
        <Button variant="ghost">Learn more</Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}
