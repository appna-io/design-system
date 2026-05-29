import { useState } from 'react';

import { Button, Combobox, MultiCombobox } from '@apx-ui/ds';

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

const SKILLS = [
  { value: 'design', label: 'Design' },
  { value: 'eng', label: 'Engineering' },
  { value: 'pm', label: 'Product' },
  { value: 'ops', label: 'Operations' },
];

export default function FormSubmission() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-3 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(
          `country=${data.get('country') ?? ''}; skills=${data.getAll('skills').join(',')}`,
        );
      }}
    >
      <Combobox
        name="country"
        aria-label="Country"
        placeholder="Pick a country"
        options={COUNTRIES}
      />
      <MultiCombobox
        name="skills"
        aria-label="Skills"
        placeholder="Pick skills"
        options={SKILLS}
      />
      <Button type="submit">Submit</Button>
      {submitted ? (
        <code className="rounded bg-bg-subtle p-2 text-xs">{submitted}</code>
      ) : null}
    </form>
  );
}
