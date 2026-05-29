import { useState } from 'react';

import { Calendar } from 'apx-ds';

export default function Sizes() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Small</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="sm" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Medium</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="md" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Large</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="lg" />
      </div>
    </div>
  );
}
