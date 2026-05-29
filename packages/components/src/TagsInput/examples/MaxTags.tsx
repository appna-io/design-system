import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

export default function MaxTags() {
  const [tags, setTags] = useState<string[]>(['alpha', 'beta']);
  return (
    <TagsInput
      label="Up to 5 tags"
      maxTags={5}
      showCount
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}
