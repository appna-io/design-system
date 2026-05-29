import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

export default function PasteCsv() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TagsInput
        label="Paste a CSV or newline-separated list"
        description="Try pasting: red, green, blue; yellow\norange"
        placeholder="Paste here…"
        value={tags}
        onChange={(next) => setTags([...next])}
        splitOn={/[,;\s\n]+/}
      />
      <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
        Parsed tags: <code>{JSON.stringify(tags)}</code>
      </span>
    </div>
  );
}
