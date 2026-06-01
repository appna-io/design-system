import { useState } from 'react';
import { Rating } from '@apx-ui/ds';

export default function ErrorState() {
  const [value, setValue] = useState(0);
  const error = value === 0 ? 'Please rate before submitting.' : undefined;
  return (
    <Rating
      label="Rate your experience"
      required
      value={value}
      onChange={(next) => setValue(next)}
      error={error}
    />
  );
}