import { useState } from 'react';
import { TagsInput } from 'apx-ds';

export default function AllowDuplicates() {
  const [tags, setTags] = useState<string[]>(['repeat', 'repeat']);
  return (
    <TagsInput
      label="Duplicates allowed"
      description="By default duplicates are rejected; this field opts in."
      allowDuplicates
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}
