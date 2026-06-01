import { TagsInput } from '@apx-ui/ds';

const SKILLS = [
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'GraphQL',
  'PostgreSQL',
  'Rust',
  'Go',
  'Python',
];

export default function Overview() {
  return (
    <TagsInput
      label="Tech stack"
      description="Pre-filled tags with suggestions — start typing to filter or add your own."
      defaultValue={['React', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL']}
      suggestions={SKILLS}
      placeholder="Add a skill…"
    />
  );
}