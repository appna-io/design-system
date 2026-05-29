import { useState } from 'react';
import { TagsInput } from 'apx-ds';

export default function ShowCount() {
  const [tags, setTags] = useState<string[]>(['one', 'two', 'three']);
  return (
    <TagsInput
      label="With count"
      showCount
      maxTags={10}
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}
