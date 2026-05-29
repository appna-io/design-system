import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailValidation() {
  const [emails, setEmails] = useState<string[]>([]);
  return (
    <TagsInput
      label="To"
      description="Press Enter, comma, or space to add a recipient."
      placeholder="someone@example.com"
      value={emails}
      onChange={(next) => setEmails([...next])}
      validate={(tag) => EMAIL.test(tag) || 'Not a valid email'}
      splitOn={[' ', ',', ';']}
    />
  );
}
