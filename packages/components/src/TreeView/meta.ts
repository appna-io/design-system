import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'tree-view',
  displayName: 'TreeView',
  description:
    'Hierarchical tree primitive with the full W3C ARIA TreeView keyboard pattern. Two equivalent APIs (data-driven and compound `<TreeView.Node>`), controlled / uncontrolled expansion + selection (none / single / multiple), optional checkbox adornment, async `loadChildren`, type-to-search, roving tabindex, RTL-aware ArrowLeft/ArrowRight semantics. Out of scope: virtualization and drag-and-drop (deferred follow-ups).',
  category: 'Data Display',
  tags: ['tree', 'hierarchy', 'navigation', 'file-explorer', 'taxonomy'],
};
