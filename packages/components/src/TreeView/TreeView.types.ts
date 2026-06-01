import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import type { Sx } from '@apx-ui/engine';

/** Density token — controls row vertical padding and font size. */
export type TreeViewSize = 'sm' | 'md' | 'lg';

/** Selection rules. */
export type TreeViewSelectionMode = 'none' | 'single' | 'multiple';

/** Translatable strings consumed by the tree at runtime. */
export interface TreeViewTranslations {
  /** Toggle button label when the branch is collapsed. */
  expand: string;
  /** Toggle button label when the branch is expanded. */
  collapse: string;
  /** Sentinel while `loadChildren` is in flight. */
  loading: string;
  /** Label when an async load fails. */
  loadError: string;
  /** Retry button label after a failed async load. */
  retry: string;
}

/** Default English translation bundle. Spread + override per-prop, no provider needed. */
export const DEFAULT_TREE_TRANSLATIONS: TreeViewTranslations = {
  expand: 'Expand',
  collapse: 'Collapse',
  loading: 'Loading…',
  loadError: 'Failed to load',
  retry: 'Retry',
};

/** Single hierarchical data node. */
export interface TreeNodeData {
  /** Stable unique id. Used as focus / selection / expansion key. */
  id: string;
  /** Visible label — strings are rendered with the default `renderNode`; arbitrary nodes flow through. */
  label: ReactNode;
  /** Synchronous children. Leave undefined and provide `loadChildren` to lazy-load. */
  children?: TreeNodeData[];
  /** When async, signal a branch (renders the chevron) before children arrive. @default inferred from `children` */
  hasChildren?: boolean;
  /** Per-node icon — overrides `defaultIcon` / `expandedIcon` / `leafIcon`. */
  icon?: ReactNode;
  /** Disable focus + selection for this node. */
  disabled?: boolean;
  /** Mark this node as a non-selectable "header" — focus still works, selection clicks no-op. @default true */
  selectable?: boolean;
  /** Consumer-owned payload. Not interpreted by the component. */
  meta?: Record<string, unknown>;
}

/** Snapshot supplied to a custom `renderNode` so consumers can branch on tree state. */
export interface TreeNodeRenderState {
  level: number;
  expanded: boolean;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
  hasChildren: boolean;
  loading: boolean;
}

export type TreeNodeRenderer = (
  node: TreeNodeData,
  state: TreeNodeRenderState,
) => ReactNode;

/** Per-node async load tuple — tracked inside the TreeView. */
export interface TreeAsyncState {
  loading: boolean;
  error: string | undefined;
}

export interface TreeViewProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  /** Hierarchical data array. Omit when using the compound `<TreeView.Node>` API. */
  data?: TreeNodeData[];
  /** Compound nodes — wins over `data` when both are provided. */
  children?: ReactNode;

  /** @default 'single' */
  selectionMode?: TreeViewSelectionMode;
  /** Controlled selection. `string` for `single`, `string[]` for `multiple`. */
  selected?: string | string[] | undefined;
  /** Uncontrolled initial selection. */
  defaultSelected?: string | string[] | undefined;
  /** Fires when the selection set changes. Receives the canonical shape for the current mode. */
  onSelectedChange?: (selected: string | string[]) => void;
  /** Single-select sugar — receives the new active id (or `''` when cleared). */
  onSelect?: (id: string) => void;
  /** When true and selectionMode is `multiple`, render a `<Checkbox>` adornment per node. */
  showCheckboxes?: boolean;

  /** Controlled expansion. */
  expanded?: string[] | undefined;
  /** Uncontrolled initial expansion. */
  defaultExpanded?: string[] | undefined;
  /** Fires when the expansion set changes. */
  onExpandedChange?: (expanded: string[]) => void;

  /** Lazy children resolver. Called once per branch the first time it expands. */
  loadChildren?: (node: TreeNodeData) => Promise<TreeNodeData[]>;

  /** Override the per-row visual layout while keeping all keyboard / a11y behavior. */
  renderNode?: TreeNodeRenderer;
  /** Default icon for collapsed branches. */
  defaultIcon?: ReactNode;
  /** Icon for expanded branches. */
  expandedIcon?: ReactNode;
  /** Icon for leaf nodes. */
  leafIcon?: ReactNode;

  /** @default 'md' */
  size?: TreeViewSize;
  /** Indentation in pixels per depth level. @default 20 */
  indent?: number;
  /** Show VS-Code style sibling connector lines on the leading edge. @default false */
  showLines?: boolean;

  /**
   * Accessible name for the tree. **Required** unless `aria-labelledby` is provided. The W3C
   * pattern requires every `role="tree"` to have an accessible name.
   */
  ariaLabel?: string;
  /** Override individual translation keys without supplying the whole bundle. */
  translations?: Partial<TreeViewTranslations>;

  sx?: Sx;
  ref?: Ref<HTMLUListElement>;
}

/** Props for the compound `<TreeView.Node>` form. */
export interface TreeViewNodeProps {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  selectable?: boolean;
  /** Default the node to expanded on first paint. Ignored once expansion is controlled. */
  defaultExpanded?: boolean;
  /** Mark the branch as having async children (renders the chevron before they load). */
  hasChildren?: boolean;
  /** Consumer payload — flows through to `renderNode` and selection callbacks. */
  meta?: Record<string, unknown>;
  children?: ReactNode;
}

/** Context payload shared from `<TreeView>` to every descendant `<TreeView.Node>`. */
export interface TreeViewContextValue {
  selectionMode: TreeViewSelectionMode;
  showCheckboxes: boolean;
  expanded: ReadonlySet<string>;
  selected: ReadonlySet<string>;
  focusedId: string | undefined;
  size: TreeViewSize;
  indent: number;
  showLines: boolean;
  translations: TreeViewTranslations;
  renderNode: TreeNodeRenderer | undefined;
  defaultIcon: ReactNode;
  expandedIcon: ReactNode;
  leafIcon: ReactNode;
  asyncState: ReadonlyMap<string, TreeAsyncState>;
  toggleExpanded: (id: string) => void;
  selectNode: (id: string, additive: boolean) => void;
  setFocus: (id: string) => void;
  registerNode: (id: string, ref: HTMLLIElement | null) => void;
  loadChildrenIfNeeded: (node: TreeNodeData) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLLIElement>, node: TreeNodeData) => void;
}

export type TreeViewStyle = CSSProperties;