import { useState } from 'react';
import { Badge } from 'apx-ds';

const INITIAL_TAGS = ['typescript', 'react', 'design-systems', 'tailwind'];

export default function Removable() {
  const [tags, setTags] = useState<string[]>(INITIAL_TAGS);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="soft"
            color="primary"
            removable
            onRemove={() => setTags((current) => current.filter((t) => t !== tag))}
          >
            {tag}
          </Badge>
        ))}
        {tags.length === 0 ? (
          <button
            type="button"
            onClick={() => setTags(INITIAL_TAGS)}
            className="text-xs text-fg-muted underline"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
