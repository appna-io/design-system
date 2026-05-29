import { useState } from 'react';

import { Calendar } from '@apx-ui/ds';

/**
 * Same calendar in three locales — drives weekday/month names + first-day-of-week from
 * `Intl.Locale.weekInfo`. No locale data shipped with the DS.
 */
export default function Locales() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Section title="English (US) — Sun start" locale="en-US">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="en-US" />
      </Section>
      <Section title="German (DE) — Mon start" locale="de-DE">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="de-DE" />
      </Section>
      <Section title="Japanese (JP) — Sun start" locale="ja-JP">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="ja-JP" />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  locale,
}: {
  title: string;
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-2" lang={locale}>
      <h3 className="text-sm font-semibold text-fg-default">{title}</h3>
      {children}
    </div>
  );
}
