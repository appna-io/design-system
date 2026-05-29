import { useState } from 'react';
import { Input } from 'apx-ds';

export default function Controlled() {
  const [value, setValue] = useState('hello');

  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="controlled-input">Controlled</label>
        <Input
          id="controlled-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span className="text-xs text-fg-muted">value: &quot;{value}&quot;</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="uncontrolled-input">Uncontrolled</label>
        <Input id="uncontrolled-input" defaultValue="hello" />
        <span className="text-xs text-fg-muted">read via ref / form data</span>
      </div>
    </div>
  );
}
