import { useState } from 'react';
import { Div, TagsInput, Typography } from '@apx-ui/ds';

const LIBRARIES = ['react', 'vue', 'svelte', 'solid'];

const DESCRIPTIONS: Record<string, string> = {
  react: 'A JavaScript library for building user interfaces.',
  vue: 'The progressive JavaScript framework.',
  svelte: 'Cybernetically enhanced web apps.',
  solid: 'Simple and performant reactivity for building UIs.',
};

export default function CustomRenderSuggestion() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <TagsInput
      label="Frameworks"
      suggestions={LIBRARIES}
      renderSuggestion={(item, { query }) => (
        <Div display="flex" flexDirection="column" sx={{ lineHeight: 1.2 }}>
          <strong>{item}</strong>
          <Typography as="span" variant="caption" color="fg.muted">
            {DESCRIPTIONS[item]}
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
