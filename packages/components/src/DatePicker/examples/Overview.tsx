import { useState } from 'react';
import { DatePicker, Div, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<DatePicker />` — a single field with a pre-selected date,
 * showing typed input, calendar popover, and clear affordances in one glance.
 */
export default function Overview() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 4, 15));

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3" className="max-w-xs">
      <Typography variant="bodySmall" color="fg.muted">
        Type a date or open the calendar — the field stays in sync and posts ISO-8601 in forms.
      </Typography>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="Select a date"
        clearable
      />
      <Typography variant="caption" color="fg.muted">
        Selected: {value ? value.toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'None'}
      </Typography>
    </Div>
  );
}