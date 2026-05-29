import { useState } from 'react';
import { Textarea } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState('hello\nworld');

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="controlled-textarea">Controlled</label>
        <Textarea
          id="controlled-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <span className="text-xs text-fg-muted">value length: {value.length}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="uncontrolled-textarea">Uncontrolled</label>
        <Textarea id="uncontrolled-textarea" defaultValue="hello\nworld" rows={3} />
        <span className="text-xs text-fg-muted">read via ref / form data</span>
      </div>
    </div>
  );
}
