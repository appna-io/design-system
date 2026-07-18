import { useState } from 'react';
import { Div, TagsInput, Typography } from '@apx-ui/ds';

const USERS = [
  { name: 'Ada Lovelace', email: 'ada@example.com' },
  { name: 'Grace Hopper', email: 'grace@example.com' },
  { name: 'Alan Turing', email: 'alan@example.com' },
  { name: 'Linus Torvalds', email: 'linus@example.com' },
];

const NAME_BY_EMAIL = new Map(USERS.map((u) => [u.email, u.name]));

/** Suggestions are the email strings; the display name comes from a lookup at render time. */
async function searchUsers(query: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 250));
  const q = query.toLowerCase();
  return USERS.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  ).map((u) => u.email);
}

export default function AsyncSuggestions() {
  const [recipients, setRecipients] = useState<string[]>([]);
  return (
    <TagsInput
      label="Recipients"
      description="Start typing a name or email."
      loadSuggestions={(query) => searchUsers(query)}
      renderSuggestion={(email) => (
        <Div display="flex" flexDirection="column" sx={{ lineHeight: 1.2 }}>
          <strong>{NAME_BY_EMAIL.get(email) ?? email}</strong>
          <Typography as="span" variant="caption" color="fg.muted">
            {email}
          </Typography>
        </Div>
      )}
      value={recipients}
      onChange={(next) => setRecipients([...next])}
    />
  );
}
