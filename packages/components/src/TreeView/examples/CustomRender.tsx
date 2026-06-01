import { Badge, Div, TreeView, Typography } from '@apx-ui/ds';
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
    <Div className="max-w-sm rounded-md border border-border-subtle p-2">
      <TreeView
        ariaLabel="Custom render"
        data={data}
        defaultExpanded={['app']}
        renderNode={(node, state) => (
          <Typography as="span" variant="bodySmall" className="flex w-full items-center gap-2">
            <Typography as="span" variant="bodySmall" color="fg.default" weight={state.hasChildren ? 'medium' : undefined}>
              {state.hasChildren ? (state.expanded ? '📂' : '📁') : '📄'} {node.label}
            </Typography>
            {typeof node.meta?.badge === 'number' ? (
              <Badge variant="subtle" color="primary">
                {String(node.meta.badge)}
              </Badge>
            ) : null}
            {node.meta?.active ? (
              <Typography as="span" variant="caption" color="success.emphasis" className="ml-auto">
                live
              </Typography>
            ) : null}
          </Typography>
        )}
      />
    </Div>
  );
}