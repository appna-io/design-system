import { Div, TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

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
    <Div className="max-w-sm rounded-md border border-border-subtle p-2" dir="rtl">
      <TreeView
        ariaLabel="עץ דוחות"
        data={data}
        defaultExpanded={['דוחות']}
        translations={{ expand: 'הרחב', collapse: 'כווץ', loading: 'טוען…' }}
      />
    </Div>
  );
}