import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

export default function WithLabel() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <TagsInput
      label="Project tags"
      description="Tags help teammates find related work."
      helperText="Press Enter or comma to add a tag."
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}