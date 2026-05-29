import { useState } from 'react';
import { Textarea } from 'apx-ds';

export default function WithCount() {
  const [value, setValue] = useState(
    'Counts update live. Type more to watch the limit indicator trip when you hit 120.',
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="count-limited">With maxLength + showCount</label>
        <Textarea
          id="count-limited"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          showCount
          maxLength={120}
        />
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="count-only">Just showCount (no cap)</label>
        <Textarea
          id="count-only"
          showCount
          placeholder="Start typing to see the live count…"
        />
      </div>
    </div>
  );
}
