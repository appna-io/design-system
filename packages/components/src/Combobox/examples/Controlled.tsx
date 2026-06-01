import { useState } from 'react';

import { Button, Combobox, Div, Typography } from '@apx-ui/ds';

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

export default function Controlled() {
  const [value, setValue] = useState<string | null>('fr');
  const [inputValue, setInputValue] = useState<string>('France');

  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-sm">
      <Combobox
        aria-label="Country"
        placeholder="Pick a country"
        options={COUNTRIES}
        value={value}
        onChange={setValue}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      />
      <Div display="flex" alignItems="center" gap="2" className="text-sm text-fg-muted">
        <Typography as="span" variant="bodySmall" color="fg.muted">
          Value: <code>{value ?? '(none)'}</code> · Query: <code>{inputValue || '(empty)'}</code>
        </Typography>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue(null);
            setInputValue('');
          }}
        >
          Clear
        </Button>
      </Div>
    </Div>
  );
}