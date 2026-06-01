import { useState, type FormEvent } from 'react';

import { DatePicker, DateRangePicker, Typography, type DateRange } from '@apx-ui/ds';

/**
 * Both pickers ride a hidden `<input type="hidden">` with the ISO-8601 (`YYYY-MM-DD`)
 * payload — form posts get an unambiguous, locale-free value regardless of `format`.
 */
export default function FormSubmission() {
  const [submitted, setSubmitted] = useState<Record<string, FormDataEntryValue>>({});
  const [, setDob] = useState<Date | null>(null);
  const [, setRange] = useState<DateRange>({ start: null, end: null });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitted(Object.fromEntries(formData.entries()));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        <Typography as="span" variant="bodySmall" weight="medium">
          Date of birth
        </Typography>
        <DatePicker name="dob" required onChange={setDob} />
      </label>

      <label className="flex flex-col gap-1">
        <Typography as="span" variant="bodySmall" weight="medium">
          Holiday range
        </Typography>
        <DateRangePicker name="holiday" onChange={setRange} />
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-fg-onPrimary hover:bg-primary-emphasis"
      >
        Submit
      </button>

      {Object.keys(submitted).length > 0 ? (
        <pre className="rounded-md bg-bg-subtle p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </form>
  );
}