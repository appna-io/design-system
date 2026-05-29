import { useState } from 'react';
import { Rating } from 'apx-ds';

export default function WithLabel() {
  const [value, setValue] = useState(0);
  return (
    <Rating
      label="Rate your experience"
      description="Tap a star to submit your rating."
      helperText="You can change this later in your account settings."
      value={value}
      onChange={(next) => setValue(next)}
    />
  );
}
