import { TreeView } from 'apx-ds';
import type { TreeNodeData } from 'apx-ds';

const data: TreeNodeData[] = [
  {
    id: 'דוחות',
    label: 'דוחות',
    children: [
      { id: 'דוחות/חודשי', label: 'חודשי' },
      { id: 'דוחות/שנתי', label: 'שנתי' },
    ],
  },
];

export default function Translations() {
  return (
    <div className="max-w-sm border border-border-subtle rounded-md p-2" dir="rtl">
      <TreeView
        ariaLabel="עץ דוחות"
        data={data}
        defaultExpanded={['דוחות']}
        translations={{ expand: 'הרחב', collapse: 'כווץ', loading: 'טוען\u2026' }}
      />
    </div>
  );
}
