import { useState } from 'react';
import { TagsInput } from 'apx-ds';

const SKILLS = [
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'Solid',
  'Qwik',
  'TypeScript',
  'JavaScript',
  'Rust',
  'Go',
  'Python',
];

export default function WithSuggestions() {
  const [skills, setSkills] = useState<string[]>([]);
  return (
    <TagsInput
      label="Skills"
      description="Start typing to filter suggestions, or add your own."
      suggestions={SKILLS}
      value={skills}
      onChange={(next) => setSkills([...next])}
    />
  );
}
