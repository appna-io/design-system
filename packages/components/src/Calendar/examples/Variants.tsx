import { useState } from 'react';

import { Calendar } from '@apx-ui/ds';

export default function Variants() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Solid (default)</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="solid" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Outline</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="outline" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Soft</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="soft" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Minimal</h3>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="minimal" />
      </div>
    </div>
  );
}
