import { useState } from 'react';
import { Badge, Div, Typography } from '@apx-ui/ds';

const INITIAL_TAGS = ['typescript', 'react', 'design-systems', 'tailwind'];

export default function Removable() {
  const [tags, setTags] = useState<string[]>(INITIAL_TAGS);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" alignItems="center" gap="2">
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
          <Typography
            as="button"
            variant="bodySmall"
            color="muted"
            sx={{ textDecoration: 'underline' }}
            onClick={() => setTags(INITIAL_TAGS)}
          >
            Reset
          </Typography>
        ) : null}
      </Div>
    </Div>
  );
}