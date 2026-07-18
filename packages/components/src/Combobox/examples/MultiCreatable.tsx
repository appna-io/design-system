import { useState } from 'react';

import { MultiCombobox, Div } from '@apx-ui/ds';

type Tag = { value: string; label: string };

const INITIAL: Tag[] = [
  { value: 'design', label: 'design' },
  { value: 'a11y', label: 'a11y' },
  { value: 'motion', label: 'motion' },
];

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function MultiCreatable() {
  const [options, setOptions] = useState<Tag[]>(INITIAL);
  const [value, setValue] = useState<string[]>([]);

  return (
    <Div className="max-w-sm">
      <MultiCombobox
        aria-label="Tags"
        placeholder="Type a tag and press Enter…"
        options={options}
        value={value}
        onChange={setValue}
        creatable
        onCreateOption={(label) => {
          const newOption = { value: slugify(label) || label, label };
          setOptions((prev) => [...prev, newOption]);
          return newOption;
        }}
      />
    </Div>
  );
}