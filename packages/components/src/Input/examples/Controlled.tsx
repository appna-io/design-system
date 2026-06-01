import { useState } from 'react';
import { Div, Input, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState('hello');

  return (
    <Div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="controlled-input">Controlled</label>
        <Input
          id="controlled-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Typography as="span" variant="caption" color="fg.muted">
          value: &quot;{value}&quot;
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="uncontrolled-input">Uncontrolled</label>
        <Input id="uncontrolled-input" defaultValue="hello" />
        <Typography as="span" variant="caption" color="fg.muted">
          read via ref / form data
        </Typography>
      </Div>
    </Div>
  );
}