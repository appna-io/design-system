import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

interface User {
  id: string;
  name: string;
  email: string;
}

const USERS: User[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com' },
  { id: '4', name: 'Linus Torvalds', email: 'linus@example.com' },
];

async function searchUsers(query: string): Promise<User[]> {
  await new Promise((r) => setTimeout(r, 250));
  return USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );
}

export default function AsyncSuggestions() {
  const [recipients, setRecipients] = useState<string[]>([]);
  return (
    <TagsInput<User>
      label="Recipients"
      description="Start typing a name or email."
      loadSuggestions={(query) => searchUsers(query)}
      getSuggestionValue={(user) => user.email}
      getSuggestionKey={(user) => user.id}
      renderSuggestion={(user) => (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <strong>{user.name}</strong>
          <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>{user.email}</span>
        </div>
      )}
      value={recipients}
      onChange={(next) => setRecipients([...next])}
    />
  );
}
