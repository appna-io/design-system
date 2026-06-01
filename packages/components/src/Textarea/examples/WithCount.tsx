import { useState } from 'react';
import { Div, Textarea } from '@apx-ui/ds';

export default function WithCount() {
  const [value, setValue] = useState(
    'Counts update live. Type more to watch the limit indicator trip when you hit 120.',
  );

  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-md">
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="count-limited">With maxLength + showCount</label>
        <Textarea
          id="count-limited"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          showCount
          maxLength={120}
        />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="count-only">Just showCount (no cap)</label>
        <Textarea
          id="count-only"
          showCount
          placeholder="Start typing to see the live count…"
        />
      </Div>
    </Div>
  );
}