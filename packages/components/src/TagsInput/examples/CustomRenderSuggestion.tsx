import { useState } from 'react';
import { Div, TagsInput, Typography } from '@apx-ui/ds';

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
        <Div display="flex" flexDirection="column" sx={{ lineHeight: 1.2 }}>
          <strong>{item.value}</strong>
          <Typography as="span" variant="caption" color="fg.muted">
            {item.description}
          </Typography>
          {query ? (
            <Typography as="span" variant="caption" color="fg.muted" sx={{ fontSize: 10 }}>
              matching &ldquo;{query}&rdquo;
            </Typography>
          ) : null}
        </Div>
      )}
      value={tags}
      onChange={(next) => setTags([...next])}
    />
  );
}