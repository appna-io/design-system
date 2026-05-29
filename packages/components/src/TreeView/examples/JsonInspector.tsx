import { TreeView } from 'apx-ds';
import type { TreeNodeData } from 'apx-ds';

function toNode(key: string, value: unknown, path: string): TreeNodeData {
  const id = `${path}/${key}`;
  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value)
      ? value.map((v, i) => toNode(String(i), v, id))
      : Object.entries(value).map(([k, v]) => toNode(k, v, id));
    return {
      id,
      label: (
        <span>
          <span className="font-medium text-fg-default">{key}</span>{' '}
          <span className="text-fg-muted">{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>
        </span>
      ),
      children: entries,
    };
  }
  return {
    id,
    label: (
      <span>
        <span className="font-medium text-fg-default">{key}</span>:{' '}
        <span className="text-primary-emphasis">{JSON.stringify(value)}</span>
      </span>
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
    <div className="max-w-md border border-border-subtle rounded-md p-2">
      <TreeView
        ariaLabel="JSON inspector"
        data={data}
        defaultExpanded={['/user', '/preferences']}
        selectionMode="none"
      />
    </div>
  );
}
