import { useState } from 'react';
import { TagsInput } from 'apx-ds';

interface Tag {
  value: string;
  description: string;
}

const LIBRARIES: Tag[] = [
  { value: 'react', description: 'A JavaScript library for building user interfaces.' },
  { value: 'vue', description: 'The progressive JavaScript framework.' },
  { value: 'svelte', description: 'Cybernetically enhanced web apps.' },
  { value: 'solid', description: 'Simple and performant reactivity for building UIs.' },
];

export default function CustomRenderSuggestion() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <TagsInput<Tag>
      label="Frameworks"
      suggestions={LIBRARIES}
      getSuggestionValue={(item) => item.value}
      renderSuggestion={(item, { query }) => (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <strong>{item.value}</strong>
          <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
            {item.description}
          </span>
          {query ? (
            <span style={{ fontSize: 10, color: 'var(--sds-color-fg-muted)' }}>
              matching “{query}”
            </span>
          ) : null}
        </div>
      )}
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}
