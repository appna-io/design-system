import { useState } from 'react';
import { Badge, TagsInput } from '@apx-ui/ds';

export default function CustomRenderTag() {
  const [tags, setTags] = useState<string[]>(['design', 'engineering', 'product']);
  return (
    <TagsInput
      label="Custom render"
      value={tags}
      onChange={(next) => setTags([...next])}
      renderTag={(tag, { invalid, removeProps }) => (
        <Badge
          variant="outline"
          color={invalid ? 'danger' : 'primary'}
          shape="pill"
          size="sm"
          rightIcon={
            <button
              {...removeProps}
              style={{
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                color: 'inherit',
                font: 'inherit',
              }}
            >
              ×
            </button>
          }
        >
          #{tag}
        </Badge>
      )}
    />
  );
}