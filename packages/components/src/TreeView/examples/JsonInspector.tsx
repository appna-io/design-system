import { Div, TreeView, Typography } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

function toNode(key: string, value: unknown, path: string): TreeNodeData {
  const id = `${path}/${key}`;
  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value)
      ? value.map((v, i) => toNode(String(i), v, id))
      : Object.entries(value).map(([k, v]) => toNode(k, v, id));
    return {
      id,
      label: (
        <Typography as="span" variant="bodySmall">
          <Typography as="span" variant="bodySmall" weight="medium" color="fg.default">
            {key}
          </Typography>{' '}
          <Typography as="span" variant="bodySmall" color="fg.muted">
            {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
          </Typography>
        </Typography>
      ),
      children: entries,
    };
  }
  return {
    id,
    label: (
      <Typography as="span" variant="bodySmall">
        <Typography as="span" variant="bodySmall" weight="medium" color="fg.default">
          {key}
        </Typography>
        :{' '}
        <Typography as="span" variant="bodySmall" color="primary.emphasis">
          {JSON.stringify(value)}
        </Typography>
      </Typography>
    ),
  };
}

const sample = {
  user: { id: 12, name: 'Maya', roles: ['admin', 'editor'] },
  active: true,
  preferences: { theme: 'dark', density: 'compact' },
};

const data: TreeNodeData[] = Object.entries(sample).map(([k, v]) => toNode(k, v, ''));

export default function JsonInspector() {
  return (
    <Div className="max-w-md rounded-md border border-border-subtle p-2">
      <TreeView
        ariaLabel="JSON inspector"
        data={data}
        defaultExpanded={['/user', '/preferences']}
        selectionMode="none"
      />
    </Div>
  );
}