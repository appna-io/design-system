import { useState } from 'react';
import { Div, TagsInput } from '@apx-ui/ds';

export default function Variants() {
  const [a, setA] = useState<string[]>(['filled']);
  const [b, setB] = useState<string[]>(['outline']);
  const [c, setC] = useState<string[]>(['ghost']);
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <TagsInput label="Filled" variant="filled" value={a} onChange={(n) => setA([...n])} />
      <TagsInput label="Outline (default)" variant="outline" value={b} onChange={(n) => setB([...n])} />
      <TagsInput label="Ghost" variant="ghost" value={c} onChange={(n) => setC([...n])} />
    </Div>
  );
}