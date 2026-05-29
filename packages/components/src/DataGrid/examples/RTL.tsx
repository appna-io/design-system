import { DataGrid, DirectionProvider, heDataGridTranslations } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface Row {
  id: number;
  name: string;
  email: string;
  team: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'מאיה כהן', email: 'maya@example.com', team: 'פלטפורמה', signups: 124 },
  { id: 2, name: 'ליאם לוי', email: 'liam@example.com', team: 'צמיחה', signups: 42 },
  { id: 3, name: 'אווה בן-דוד', email: 'ava@example.com', team: 'עיצוב', signups: 218 },
  { id: 4, name: 'נועם רוזן', email: 'noam@example.com', team: 'נתונים', signups: 81 },
  { id: 5, name: 'תמר ישראלי', email: 'tamar@example.com', team: 'תפעול', signups: 9 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'שם', accessor: 'name', sortable: true, type: 'text', pinned: 'start' },
  { id: 'email', header: 'דוא״ל', accessor: 'email', type: 'text' },
  { id: 'team', header: 'צוות', accessor: 'team', sortable: true, type: 'text' },
  {
    id: 'signups',
    header: 'הרשמות',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
  },
];

export default function RTL() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Hebrew strings + <code>dir=&quot;rtl&quot;</code>. The pinned <strong>שם</strong> column
        sticks to the logical-start edge (the right side under RTL), the sort indicator on{' '}
        <strong>הרשמות</strong> flips with the text direction, and every visible string flows
        through <code>heDataGridTranslations</code>.
      </p>
      <DirectionProvider dir="rtl">
        <div dir="rtl">
          <DataGrid<Row>
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            selectionMode="multiple"
            translations={heDataGridTranslations}
          />
        </div>
      </DirectionProvider>
    </div>
  );
}
