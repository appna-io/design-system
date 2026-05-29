import { useState } from 'react';

import { MultiCombobox } from 'apx-ds';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'astro', label: 'Astro' },
];

export default function Multi() {
  const [value, setValue] = useState<string[]>(['react', 'svelte']);
  return (
    <div className="max-w-sm">
      <MultiCombobox
        aria-label="Frameworks"
        placeholder="Pick frameworks"
        options={FRAMEWORKS}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
