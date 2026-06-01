import { useState } from 'react';

import { DatePicker, Div, Typography } from '@apx-ui/ds';

export default function Locales() {
  const [a, setA] = useState<Date | null>(new Date());
  const [b, setB] = useState<Date | null>(new Date());
  const [c, setC] = useState<Date | null>(new Date());

  return (
    <Div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
      <Field label="en-US (Sun start)">
        <DatePicker value={a} onChange={setA} locale="en-US" format="MM/dd/yyyy" />
      </Field>
      <Field label="de-DE (Mon start)">
        <DatePicker value={b} onChange={setB} locale="de-DE" format="dd.MM.yyyy" />
      </Field>
      <Field label="ja-JP">
        <DatePicker value={c} onChange={setC} locale="ja-JP" format="yyyy/MM/dd" />
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