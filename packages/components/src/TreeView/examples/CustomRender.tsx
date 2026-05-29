import { Badge, TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'app',
    label: 'App',
    children: [
      { id: 'app/home', label: 'Home', meta: { active: true } },
      { id: 'app/settings', label: 'Settings', meta: { badge: 3 } },
      { id: 'app/billing', label: 'Billing' },
    ],
  },
];

export default function CustomRender() {
  return (
    <div className="max-w-sm border border-border-subtle rounded-md p-2">
      <TreeView
        ariaLabel="Custom render"
        data={data}
        defaultExpanded={['app']}
        renderNode={(node, state) => (
          <span className="flex w-full items-center gap-2">
            <span className={state.hasChildren ? 'text-fg-default font-medium' : 'text-fg-default'}>
              {state.hasChildren ? (state.expanded ? '📂' : '📁') : '📄'} {node.label}
            </span>
            {typeof node.meta?.badge === 'number' ? (
              <Badge variant="subtle" color="primary">
                {String(node.meta.badge)}
              </Badge>
            ) : null}
            {node.meta?.active ? (
              <span className="text-success-emphasis ml-auto text-xs">live</span>
            ) : null}
          </span>
        )}
      />
    </div>
  );
}
