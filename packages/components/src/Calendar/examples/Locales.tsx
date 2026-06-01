import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

/**
 * Same calendar in three locales — drives weekday/month names + first-day-of-week from
 * `Intl.Locale.weekInfo`. No locale data shipped with the DS.
 */
export default function Locales() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <Div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Section title="English (US) — Sun start" locale="en-US">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="en-US" />
      </Section>
      <Section title="German (DE) — Mon start" locale="de-DE">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="de-DE" />
      </Section>
      <Section title="Japanese (JP) — Sun start" locale="ja-JP">
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} locale="ja-JP" />
      </Section>
    </Div>
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
    <Div display="flex" flexDirection="column" gap="2" lang={locale}>
      <Typography as="h3" variant="bodySmall" weight="semibold" color="fg.default">
        {title}
      </Typography>
      {children}
    </Div>
  );
}