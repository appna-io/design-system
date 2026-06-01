'use client';

import { CircularProgress, Div, Progress } from '@apx-ui/ds';
import { useEffect, useState } from 'react';

export default function Animated() {
  const [value, setValue] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 7));
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-full max-w-sm">
      <Progress value={value} size="lg" showLabel aria-label="Animated upload" />
      <Div display="flex" alignItems="center" gap="6">
        <CircularProgress value={value} showLabel aria-label="Animated circular" />
        <CircularProgress
          value={value}
          color="success"
          variant="soft"
          showLabel
          size="lg"
          aria-label="Animated circular soft"
        />
      </Div>
    </Div>
  );
}