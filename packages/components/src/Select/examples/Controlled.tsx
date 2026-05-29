import { useState } from 'react';

import { Button, Select } from 'apx-ds';

export default function Controlled() {
  const [value, setValue] = useState<string>('apple');

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Select value={value} onValueChange={setValue} placeholder="Pick a fruit" aria-label="Fruit">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select.Content>
      </Select>
      <div className="flex items-center gap-2 text-sm text-fg-muted">
        <span>
          Current: <code>{value || '(empty)'}</code>
        </span>
        <Button size="sm" variant="ghost" onClick={() => setValue('')}>
          Clear
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('cherry')}>
          Set Cherry
        </Button>
      </div>
    </div>
  );
}
