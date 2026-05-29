import { useState } from 'react';

import { Button, Combobox } from '@apx-ui/ds';

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
    <div className="flex flex-col gap-3 max-w-sm">
      <Combobox
        aria-label="Country"
        placeholder="Pick a country"
        options={COUNTRIES}
        value={value}
        onChange={setValue}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      />
      <div className="flex items-center gap-2 text-sm text-fg-muted">
        <span>
          Value: <code>{value ?? '(none)'}</code> · Query: <code>{inputValue || '(empty)'}</code>
        </span>
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
      </div>
    </div>
  );
}
