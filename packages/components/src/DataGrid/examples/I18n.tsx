import { useState } from 'react';

import {
  Button,
  DataGrid,
  DirectionProvider,
  Div,
  I18nProvider,
  Typography,
  arDataGridTranslations,
  enDataGridTranslations,
  heDataGridTranslations,
} from '@apx-ui/ds';
import type { DataGridColumnDef, DataGridTranslations } from '@apx-ui/ds';

type Locale = 'en' | 'he' | 'ar';

interface Row {
  id: number;
  name: string;
  email: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'Maya / מאיה / مايا', email: 'maya@example.com', signups: 124 },
  { id: 2, name: 'Liam / ליאם / ليام', email: 'liam@example.com', signups: 42 },
  { id: 3, name: 'Ava / אווה / آڤا', email: 'ava@example.com', signups: 218 },
  { id: 4, name: 'Noam / נועם / نعم', email: 'noam@example.com', signups: 81 },
];

const LOCALES: ReadonlyArray<{
  id: Locale;
  label: string;
  direction: 'ltr' | 'rtl';
  bundle: DataGridTranslations;
}> = [
  { id: 'en', label: 'English', direction: 'ltr', bundle: enDataGridTranslations },
  { id: 'he', label: 'עברית', direction: 'rtl', bundle: heDataGridTranslations },
  { id: 'ar', label: 'العربية', direction: 'rtl', bundle: arDataGridTranslations },
];

export default function I18n() {
  const [locale, setLocale] = useState<Locale>('en');
  const active = LOCALES.find((l) => l.id === locale)!;

  // Per-locale column header text. We could also flow this through
  // `I18nProvider` messages, but doing it inline keeps the example one file
  // and shows the typed `translations` prop wiring clearly.
  const columns: DataGridColumnDef<Row>[] = [
    {
      id: 'name',
      header: { en: 'Name', he: 'שם', ar: 'الاسم' }[locale],
      accessor: 'name',
      sortable: true,
      type: 'text',
    },
    {
      id: 'email',
      header: { en: 'Email', he: 'דוא״ל', ar: 'البريد الإلكتروني' }[locale],
      accessor: 'email',
      type: 'text',
    },
    {
      id: 'signups',
      header: { en: 'Signups', he: 'הרשמות', ar: 'الاشتراكات' }[locale],
      accessor: 'signups',
      sortable: true,
      type: 'number',
      align: 'end',
    },
  ];

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" gap="2">
        {LOCALES.map((l) => (
          <Button
            key={l.id}
            variant={l.id === locale ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setLocale(l.id)}
          >
            {l.label}
          </Button>
        ))}
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        The <code>I18nProvider</code> publishes the active <code>DataGrid</code> bundle to every
        descendant; <code>DirectionProvider</code> flips column pinning, sticky shadows, and
        sort indicators when switching to a right-to-left script. Selection + state survive a
        locale swap because <code>state.selection</code> is keyed by row id, not by index.
      </Typography>
      <I18nProvider
        locale={active.id}
        direction={active.direction}
        messages={{ DataGrid: active.bundle }}
      >
        <DirectionProvider dir={active.direction}>
          <Div dir={active.direction}>
            <DataGrid<Row>
              data={data}
              columns={columns}
              getRowId={(r) => r.id}
              selectionMode="multiple"
            />
          </Div>
        </DirectionProvider>
      </I18nProvider>
    </Div>
  );
}