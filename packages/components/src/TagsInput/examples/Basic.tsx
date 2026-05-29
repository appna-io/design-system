import { useState } from 'react';
import { TagsInput } from 'apx-ds';

export default function Basic() {
  const [tags, setTags] = useState<string[]>(['react', 'typescript']);
  return <TagsInput value={tags} onChange={(next) => setTags([...next])} label="Tags" />;
}
