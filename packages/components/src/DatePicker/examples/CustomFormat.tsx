import { useState } from 'react';

import { DatePicker, Div, Typography } from '@apx-ui/ds';

export default function CustomFormat() {
  const [a, setA] = useState<Date | null>(new Date());
  const [b, setB] = useState<Date | null>(new Date());
  const [c, setC] = useState<Date | null>(new Date());

  return (
    <Div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
      <Field label="MM/dd/yyyy">
        <DatePicker value={a} onChange={setA} format="MM/dd/yyyy" />
      </Field>
      <Field label="yyyy-MM-dd">
        <DatePicker value={b} onChange={setB} format="yyyy-MM-dd" />
      </Field>
      <Field label="d MMMM yyyy">
        <DatePicker value={c} onChange={setC} format="d MMMM yyyy" />
      </Field>
    </Div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <Typography as="span" variant="caption" weight="medium" color="fg.muted">
        {label}
      </Typography>
      {children}
    </label>
  );
}