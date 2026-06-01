import { useState } from 'react';
import { Checkbox } from '@apx-ui/ds';

const TOPICS = [
  { id: 'releases', label: 'Releases', defaultChecked: true },
  { id: 'security', label: 'Security advisories', defaultChecked: true },
  { id: 'newsletter', label: 'Monthly newsletter', defaultChecked: false },
  { id: 'beta', label: 'Beta program invites', defaultChecked: false },
] as const;

export default function Group() {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TOPICS.map((t) => [t.id, t.defaultChecked])),
  );

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="text-sm font-medium mb-1">Email me about</legend>
      {TOPICS.map((topic) => (
        <Checkbox
          key={topic.id}
          checked={selected[topic.id]}
          onCheckedChange={(checked) =>
            setSelected((prev) => ({ ...prev, [topic.id]: checked }))
          }
        >
          {topic.label}
        </Checkbox>
      ))}
    </fieldset>
  );
}