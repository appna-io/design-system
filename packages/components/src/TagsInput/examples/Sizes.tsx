import { useState } from 'react';
import { TagsInput } from '@apx-ui/ds';

export default function Sizes() {
  const [a, setA] = useState<string[]>(['small']);
  const [b, setB] = useState<string[]>(['medium']);
  const [c, setC] = useState<string[]>(['large']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TagsInput label="Small" size="sm" tagSize="xs" value={a} onChange={(n) => setA([...n])} />
      <TagsInput label="Medium" size="md" tagSize="sm" value={b} onChange={(n) => setB([...n])} />
      <TagsInput label="Large" size="lg" tagSize="md" value={c} onChange={(n) => setC([...n])} />
    </div>
  );
}
