import { useState } from 'react';

import { Button, Div, Select, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState<string>('apple');

  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-sm">
      <Select value={value} onValueChange={setValue} placeholder="Pick a fruit" aria-label="Fruit">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select.Content>
      </Select>
      <Div display="flex" alignItems="center" gap="2">
        <Typography variant="bodySmall" color="fg.muted" as="span">
          Current: <code>{value || '(empty)'}</code>
        </Typography>
        <Button size="sm" variant="ghost" onClick={() => setValue('')}>
          Clear
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('cherry')}>
          Set Cherry
        </Button>
      </Div>
    </Div>
  );
}