'use client';

import { CircularProgress, Progress } from 'apx-ds';
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
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress value={value} size="lg" showLabel aria-label="Animated upload" />
      <div className="flex items-center gap-6">
        <CircularProgress value={value} showLabel aria-label="Animated circular" />
        <CircularProgress
          value={value}
          color="success"
          variant="soft"
          showLabel
          size="lg"
          aria-label="Animated circular soft"
        />
      </div>
    </div>
  );
}
