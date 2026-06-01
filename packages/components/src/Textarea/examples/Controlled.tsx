import { useState } from 'react';
import { Div, Textarea, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState('hello\nworld');

  return (
    <Div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="controlled-textarea">Controlled</label>
        <Textarea
          id="controlled-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <Typography variant="caption" color="fg.muted">
          value length: {value.length}
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="uncontrolled-textarea">Uncontrolled</label>
        <Textarea id="uncontrolled-textarea" defaultValue="hello\nworld" rows={3} />
        <Typography variant="caption" color="fg.muted">
          read via ref / form data
        </Typography>
      </Div>
    </Div>
  );
}