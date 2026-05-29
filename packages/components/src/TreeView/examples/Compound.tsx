import { TreeView } from 'apx-ds';

export default function Compound() {
  return (
    <div className="max-w-sm border border-border-subtle rounded-md p-2">
      <TreeView ariaLabel="Compound tree">
        <TreeView.Node id="src" label="src" defaultExpanded>
          <TreeView.Node id="src/components" label="components" defaultExpanded>
            <TreeView.Node id="src/components/Button.tsx" label="Button.tsx" />
            <TreeView.Node id="src/components/Modal.tsx" label="Modal.tsx" />
          </TreeView.Node>
          <TreeView.Node id="src/index.ts" label="index.ts" />
        </TreeView.Node>
        <TreeView.Node id="package.json" label="package.json" />
      </TreeView>
    </div>
  );
}
