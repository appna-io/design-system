import { createContext, useContext } from 'react';

import { DEFAULT_TREE_TRANSLATIONS, type TreeViewContextValue } from './TreeView.types';

/**
 * Default context — `TreeView.Node` consumers always read from a Provider; the defaults
 * here only exist to satisfy the type and short-circuit "render outside a TreeView" stubs.
 */
const noop = (): void => {};

export const TreeViewContext = createContext<TreeViewContextValue>({
  selectionMode: 'single',
  showCheckboxes: false,
  expanded: new Set<string>(),
  selected: new Set<string>(),
  focusedId: undefined,
  size: 'md',
  indent: 20,
  showLines: false,
  translations: DEFAULT_TREE_TRANSLATIONS,
  renderNode: undefined,
  defaultIcon: null,
  expandedIcon: null,
  leafIcon: null,
  asyncState: new Map(),
  toggleExpanded: noop,
  selectNode: noop,
  setFocus: noop,
  registerNode: noop,
  loadChildrenIfNeeded: noop,
  onKeyDown: noop,
});

export const useTreeViewContext = (): TreeViewContextValue => useContext(TreeViewContext);
