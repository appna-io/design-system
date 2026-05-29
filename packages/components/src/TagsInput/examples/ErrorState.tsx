import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

export default function ErrorState() {
  const [tags, setTags] = useState<string[]>([]);
  const error = tags.length === 0 ? 'Add at least one tag' : undefined;
  return (
    <TagsInput
      label="Required tags"
      required
      value={tags}
      onChange={(next) => setTags([...next])}
      error={error}
    />
  );
}
