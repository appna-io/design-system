import { useState } from 'react';
import { Div, TagsInput, Typography } from '@apx-ui/ds';

export default function PasteCsv() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <TagsInput
        label="Paste a CSV or newline-separated list"
        description="Try pasting: red, green, blue; yellow\norange"
        placeholder="Paste here…"
        value={tags}
        onChange={(next) => setTags([...next])}
        splitOn={/[,;\s\n]+/}
      />
      <Typography as="span" variant="caption" color="fg.muted">
        Parsed tags: <code>{JSON.stringify(tags)}</code>
      </Typography>
    </Div>
  );
}