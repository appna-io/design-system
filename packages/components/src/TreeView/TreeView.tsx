'use client';

import { forwardRef, useI18n } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ChevronRight } from 'lucide-react';
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Checkbox } from '../Checkbox/Checkbox';
import { Spinner } from '../Spinner/Spinner';
import { TreeViewContext, useTreeViewContext } from './TreeView.context';
import {
  treeAsyncRecipe,
  treeChevronRecipe,
  treeErrorRecipe,
  treeIconRecipe,
  treeItemRecipe,
  treeLabelRecipe,
  treeRootRecipe,
} from './TreeView.recipe';
import {
  findByPrefix,
  flattenTree,
  nextFocusableId,
  siblingIds,
  type FlatTreeRow,
} from './treeHelpers';
import {
  DEFAULT_TREE_TRANSLATIONS,
  type TreeAsyncState,
  type TreeNodeData,
  type TreeNodeRenderState,
  type TreeViewContextValue,
  type TreeViewNodeProps,
  type TreeViewProps,
  type TreeViewTranslations,
} from './TreeView.types';

/* -------------------------------------------------------------------------- */
/*  Compound -> data conversion                                               */
/* -------------------------------------------------------------------------- */

/**
 * Walk the compound JSX form once and produce an equivalent `TreeNodeData[]`. We do
 * this at render time (memoized on the children identity) rather than maintaining a
 * separate render path — the data-driven path is the single source of truth for the
 * keyboard helpers and visibility math.
 */
function childrenToData(children: ReactNode): TreeNodeData[] {
  const out: TreeNodeData[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if ((child.type as { __isTreeViewNode?: boolean }).__isTreeViewNode !== true) return;
    const props = child.props as TreeViewNodeProps;
    const childData = childrenToData(props.children);
    const hasInlineChildren = childData.length > 0;
    out.push({
      id: props.id,
      label: props.label,
      ...(props.icon !== undefined ? { icon: props.icon } : {}),
      ...(props.disabled !== undefined ? { disabled: props.disabled } : {}),
      ...(props.selectable !== undefined ? { selectable: props.selectable } : {}),
      ...(props.meta !== undefined ? { meta: props.meta } : {}),
      ...(hasInlineChildren ? { children: childData } : {}),
      ...(!hasInlineChildren && props.hasChildren
        ? { hasChildren: true }
        : {}),
    });
  });
  return out;
}

/**
 * Pluck `defaultExpanded` flags from the compound form. Used only on first mount when
 * the consumer doesn't supply `defaultExpanded` explicitly.
 */
function defaultExpandedFromChildren(children: ReactNode): string[] {
  const out: string[] = [];
  const walk = (nodes: ReactNode): void => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if ((child.type as { __isTreeViewNode?: boolean }).__isTreeViewNode !== true) return;
      const props = child.props as TreeViewNodeProps;
      if (props.defaultExpanded) out.push(props.id);
      walk(props.children);
    });
  };
  walk(children);
  return out;
}

/* -------------------------------------------------------------------------- */
/*  TreeView root                                                             */
/* -------------------------------------------------------------------------- */

/**
 * `<TreeView />` — the canonical hierarchical-data primitive.
 *
 * Two equivalent APIs share the same DOM:
 *
 *  - **Data-driven** — pass a `data: TreeNodeData[]`. Best for any tree backed by an
 *    array (file systems, taxonomies, JSON inspectors).
 *  - **Compound** — drop `<TreeView.Node id="…" label="…">` children. Useful for fully
 *    static trees written inline.
 *
 * The compound form is converted to the same `TreeNodeData[]` shape before render —
 * keyboard navigation, async loading, and selection math all run off the data path so
 * the two forms are observably identical.
 *
 * **What this lane does NOT ship** (deferred to follow-ups per Leader guardrails):
 *  - Virtualization (`@tanstack/react-virtual` integration) — needs a measured 10k+
 *    node need; common trees stay under 200 nodes and render fine without it.
 *  - Drag-and-drop slot — adds bundle + axe surface; documented as a follow-up.
 *
 * @example
 *   <TreeView
 *     ariaLabel="Project files"
 *     data={files}
 *     onSelect={(id) => openFile(id)}
 *   />
 *
 *   <TreeView ariaLabel="Categories" selectionMode="multiple" showCheckboxes>
 *     <TreeView.Node id="electronics" label="Electronics">
 *       <TreeView.Node id="laptops" label="Laptops" />
 *     </TreeView.Node>
 *   </TreeView>
 */
const TreeViewImpl = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(props, ref) {
  const {
    data,
    children,
    selectionMode = 'single',
    selected: selectedProp,
    defaultSelected,
    onSelectedChange,
    onSelect,
    showCheckboxes = false,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    loadChildren,
    renderNode,
    defaultIcon = null,
    expandedIcon = null,
    leafIcon = null,
    size = 'md',
    indent = 20,
    showLines = false,
    ariaLabel,
    translations: translationsProp,
    className,
    style,
    sx,
    ...rest
  } = props;

  const resolvedData = useMemo<TreeNodeData[]>(() => {
    if (children !== undefined && children !== null) {
      return childrenToData(children);
    }
    return data ?? [];
  }, [data, children]);

  const initialExpanded = useMemo<string[]>(
    () => defaultExpanded ?? (children ? defaultExpandedFromChildren(children) : []),
    // We intentionally read this once on first render so subsequent prop changes don't
    // overwrite the consumer's uncontrolled expansion state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(initialExpanded),
  );
  const expandedSet = useMemo(
    () => new Set(expandedProp ?? Array.from(internalExpanded)),
    [expandedProp, internalExpanded],
  );

  const [internalSelected, setInternalSelected] = useState<Set<string>>(() => {
    if (defaultSelected === undefined) return new Set();
    if (Array.isArray(defaultSelected)) return new Set(defaultSelected);
    return new Set(defaultSelected ? [defaultSelected] : []);
  });
  const selectedSet = useMemo(() => {
    const source = selectedProp ?? Array.from(internalSelected);
    if (Array.isArray(source)) return new Set(source);
    return new Set(source ? [source] : []);
  }, [selectedProp, internalSelected]);

  // Async load tracking — per-node `loading` / `error` state and the resolved children.
  const [asyncState, setAsyncState] = useState<Map<string, TreeAsyncState>>(() => new Map());
  const [loadedChildren, setLoadedChildren] = useState<Map<string, TreeNodeData[]>>(
    () => new Map(),
  );
  const loadInFlight = useRef<Set<string>>(new Set());

  // Splice loaded children into the data tree so `flattenTree` "just works" after async resolves.
  const mergedData = useMemo<TreeNodeData[]>(() => {
    if (loadedChildren.size === 0) return resolvedData;
    const splice = (nodes: TreeNodeData[]): TreeNodeData[] =>
      nodes.map((n) => {
        const loaded = loadedChildren.get(n.id);
        if (loaded && (!Array.isArray(n.children) || n.children.length === 0)) {
          const { hasChildren: _ignored, ...rest } = n;
          return { ...rest, children: splice(loaded) };
        }
        if (Array.isArray(n.children)) {
          return { ...n, children: splice(n.children) };
        }
        return n;
      });
    return splice(resolvedData);
  }, [resolvedData, loadedChildren]);

  const rows = useMemo<FlatTreeRow[]>(
    () => flattenTree(mergedData, expandedSet),
    [mergedData, expandedSet],
  );

  const firstFocusable = useMemo<string | undefined>(() => {
    const row = rows.find((r) => r.visible && !r.node.disabled);
    return row?.node.id;
  }, [rows]);

  const [focusedId, setFocusedId] = useState<string | undefined>(firstFocusable);

  // Keep focusedId valid after rows change (e.g. collapse hides the active id).
  useEffect(() => {
    if (focusedId === undefined) {
      if (firstFocusable !== undefined) setFocusedId(firstFocusable);
      return;
    }
    const stillVisible = rows.some(
      (r) => r.node.id === focusedId && r.visible && !r.node.disabled,
    );
    if (!stillVisible) {
      setFocusedId(firstFocusable);
    }
  }, [focusedId, firstFocusable, rows]);

  /* --------------------- imperative updaters used by ctx --------------------- */

  const updateExpanded = useCallback(
    (next: Set<string>) => {
      if (expandedProp === undefined) setInternalExpanded(next);
      if (onExpandedChange) onExpandedChange(Array.from(next));
    },
    [expandedProp, onExpandedChange],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      const next = new Set(expandedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      updateExpanded(next);
    },
    [expandedSet, updateExpanded],
  );

  const setExpandedMany = useCallback(
    (ids: string[], makeExpanded: boolean) => {
      if (ids.length === 0) return;
      const next = new Set(expandedSet);
      ids.forEach((id) => {
        if (makeExpanded) next.add(id);
        else next.delete(id);
      });
      updateExpanded(next);
    },
    [expandedSet, updateExpanded],
  );

  const updateSelectedSet = useCallback(
    (next: Set<string>) => {
      const arrayed = Array.from(next);
      if (selectedProp === undefined) setInternalSelected(next);
      if (selectionMode === 'multiple') {
        if (onSelectedChange) onSelectedChange(arrayed);
        if (onSelect) onSelect(arrayed[0] ?? '');
      } else {
        const first = arrayed[0] ?? '';
        if (onSelectedChange) onSelectedChange(first);
        if (onSelect) onSelect(first);
      }
    },
    [onSelect, onSelectedChange, selectedProp, selectionMode],
  );

  const selectNode = useCallback(
    (id: string, additive: boolean) => {
      if (selectionMode === 'none') return;
      const node = rows.find((r) => r.node.id === id)?.node;
      if (!node || node.disabled || node.selectable === false) return;
      if (selectionMode === 'single') {
        updateSelectedSet(new Set([id]));
        return;
      }
      const next = new Set(selectedSet);
      if (additive) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        if (next.size === 1 && next.has(id)) {
          // Keep single-tap-toggle parity with click — a second tap on the only selected
          // node clears it.
          next.clear();
        } else {
          next.clear();
          next.add(id);
        }
      }
      updateSelectedSet(next);
    },
    [rows, selectedSet, selectionMode, updateSelectedSet],
  );

  /* ----------------------------- async loading ------------------------------ */

  const loadChildrenIfNeeded = useCallback(
    (node: TreeNodeData) => {
      if (!loadChildren) return;
      const hasInline = Array.isArray(node.children) && node.children.length > 0;
      if (hasInline) return;
      if (loadedChildren.has(node.id)) return;
      if (loadInFlight.current.has(node.id)) return;

      loadInFlight.current.add(node.id);
      setAsyncState((prev) => {
        const next = new Map(prev);
        next.set(node.id, { loading: true, error: undefined });
        return next;
      });

      loadChildren(node)
        .then((kids) => {
          setLoadedChildren((prev) => {
            const next = new Map(prev);
            next.set(node.id, kids);
            return next;
          });
          setAsyncState((prev) => {
            const next = new Map(prev);
            next.set(node.id, { loading: false, error: undefined });
            return next;
          });
        })
        .catch((err: unknown) => {
          setAsyncState((prev) => {
            const next = new Map(prev);
            next.set(node.id, {
              loading: false,
              error: err instanceof Error ? err.message : 'load failed',
            });
            return next;
          });
        })
        .finally(() => {
          loadInFlight.current.delete(node.id);
        });
    },
    [loadChildren, loadedChildren],
  );

  /* --------------------------- focus registration --------------------------- */

  const refsById = useRef<Map<string, HTMLLIElement>>(new Map());
  const registerNode = useCallback((id: string, el: HTMLLIElement | null) => {
    if (el) refsById.current.set(id, el);
    else refsById.current.delete(id);
  }, []);

  const setFocus = useCallback(
    (id: string) => {
      setFocusedId(id);
      const el = refsById.current.get(id);
      el?.focus();
    },
    [],
  );

  /* ------------------------------ keyboard ---------------------------------- */

  const typeaheadBuf = useRef<{ value: string; timer: ReturnType<typeof setTimeout> | null }>({
    value: '',
    timer: null,
  });

  useEffect(
    () => () => {
      if (typeaheadBuf.current.timer) clearTimeout(typeaheadBuf.current.timer);
    },
    [],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>, node: TreeNodeData) => {
      const key = event.key;
      const focused = node.id;

      // Ctrl/Cmd+A — select all visible (multi-mode only). Check before the typeahead
      // aggregator so the chord doesn't get swallowed as a search keystroke.
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a') {
        if (selectionMode !== 'multiple') return;
        event.preventDefault();
        const ids = rows
          .filter((r) => r.visible && !r.node.disabled && r.node.selectable !== false)
          .map((r) => r.node.id);
        updateSelectedSet(new Set(ids));
        return;
      }

      // Single-char + digit → type-to-search aggregator. Skip modified chords (Ctrl/Cmd
      // chords are handled above; anything else with a modifier we let through).
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        key.length === 1 &&
        /[\p{L}\p{N}]/u.test(key)
      ) {
        event.preventDefault();
        const buf = typeaheadBuf.current.value + key;
        typeaheadBuf.current.value = buf;
        if (typeaheadBuf.current.timer) clearTimeout(typeaheadBuf.current.timer);
        typeaheadBuf.current.timer = setTimeout(() => {
          typeaheadBuf.current.value = '';
        }, 500);
        const hit = findByPrefix(rows, focused, buf);
        if (hit) setFocus(hit);
        return;
      }

      switch (key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = nextFocusableId(rows, focused, 'next');
          if (next) setFocus(next);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const next = nextFocusableId(rows, focused, 'previous');
          if (next) setFocus(next);
          break;
        }
        case 'Home': {
          event.preventDefault();
          const next = nextFocusableId(rows, focused, 'first');
          if (next) setFocus(next);
          break;
        }
        case 'End': {
          event.preventDefault();
          const next = nextFocusableId(rows, focused, 'last');
          if (next) setFocus(next);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          const row = rows.find((r) => r.node.id === focused);
          if (!row) break;
          if (row.isBranch && !row.expanded) {
            toggleExpanded(focused);
            loadChildrenIfNeeded(node);
          } else if (row.isBranch && row.expanded) {
            const next = nextFocusableId(rows, focused, 'next');
            if (next) setFocus(next);
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          const row = rows.find((r) => r.node.id === focused);
          if (!row) break;
          if (row.isBranch && row.expanded) {
            toggleExpanded(focused);
          } else if (row.parentId) {
            setFocus(row.parentId);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          const row = rows.find((r) => r.node.id === focused);
          if (!row) break;
          if (selectionMode === 'none' && row.isBranch) {
            toggleExpanded(focused);
            loadChildrenIfNeeded(node);
            break;
          }
          selectNode(focused, event.ctrlKey || event.metaKey || event.shiftKey);
          if (row.isBranch && key === 'Enter' && selectionMode === 'single') {
            toggleExpanded(focused);
            loadChildrenIfNeeded(node);
          }
          break;
        }
        case '*': {
          event.preventDefault();
          const siblings = siblingIds(rows, focused);
          setExpandedMany(siblings, true);
          break;
        }
        default:
          break;
      }
    },
    [
      rows,
      selectionMode,
      selectNode,
      setExpandedMany,
      setFocus,
      toggleExpanded,
      updateSelectedSet,
      loadChildrenIfNeeded,
    ],
  );

  /* ------------------------------ rendering --------------------------------- */

  // Three-layer translation precedence (Phase 58 RFC #2): props.translations >
  // <I18nProvider messages={{ TreeView: ... }}> > built-in English defaults.
  const i18n = useI18n();
  const providerTranslations = i18n?.get<Partial<TreeViewTranslations>>('TreeView');
  const translations = useMemo(
    () => ({
      ...DEFAULT_TREE_TRANSLATIONS,
      ...providerTranslations,
      ...(translationsProp ?? {}),
    }),
    [providerTranslations, translationsProp],
  );

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: treeRootRecipe,
    componentName: 'TreeView',
    props: { size, className, sx, style },
  });

  const contextValue = useMemo<TreeViewContextValue>(
    () => ({
      selectionMode,
      showCheckboxes,
      expanded: expandedSet,
      selected: selectedSet,
      focusedId,
      size,
      indent,
      showLines,
      translations,
      renderNode,
      defaultIcon,
      expandedIcon,
      leafIcon,
      asyncState,
      toggleExpanded,
      selectNode,
      setFocus,
      registerNode,
      loadChildrenIfNeeded,
      onKeyDown,
    }),
    [
      selectionMode,
      showCheckboxes,
      expandedSet,
      selectedSet,
      focusedId,
      size,
      indent,
      showLines,
      translations,
      renderNode,
      defaultIcon,
      expandedIcon,
      leafIcon,
      asyncState,
      toggleExpanded,
      selectNode,
      setFocus,
      registerNode,
      loadChildrenIfNeeded,
      onKeyDown,
    ],
  );

  return (
    <TreeViewContext.Provider value={contextValue}>
      <ul
        {...rest}
        ref={ref}
        role="tree"
        aria-label={ariaLabel}
        aria-multiselectable={selectionMode === 'multiple' || undefined}
        className={rootClass}
        style={rootStyle ?? undefined}
        data-tree-view=""
        data-size={size}
      >
        {mergedData.map((node, index) => (
          <TreeNodeView
            key={node.id}
            node={node}
            level={0}
            posInSet={index + 1}
            setSize={mergedData.length}
          />
        ))}
      </ul>
    </TreeViewContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */
/*  Node view — recursive renderer                                            */
/* -------------------------------------------------------------------------- */

interface TreeNodeViewProps {
  node: TreeNodeData;
  level: number;
  posInSet: number;
  setSize: number;
}

function TreeNodeView({ node, level, posInSet, setSize }: TreeNodeViewProps): ReactElement {
  const ctx = useTreeViewContext();
  const liRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    ctx.registerNode(node.id, liRef.current);
    return () => ctx.registerNode(node.id, null);
  }, [ctx, node.id]);

  const hasInlineChildren = Array.isArray(node.children) && node.children.length > 0;
  const isBranch = hasInlineChildren || Boolean(node.hasChildren);
  const expanded = ctx.expanded.has(node.id);
  const selected = ctx.selected.has(node.id);
  const focused = ctx.focusedId === node.id;
  const disabled = Boolean(node.disabled);
  const selectable = node.selectable !== false && !disabled;
  const asyncSlot = ctx.asyncState.get(node.id);
  const loading = Boolean(asyncSlot?.loading);
  const error = asyncSlot?.error;

  const labelId = useId();

  const { className: itemClass } = useThemedClasses({
    recipe: treeItemRecipe,
    componentName: 'TreeView',
    slot: 'item',
    props: { size: ctx.size, selectable },
  });
  const { className: chevronClass } = useThemedClasses({
    recipe: treeChevronRecipe,
    componentName: 'TreeView',
    slot: 'chevron',
    props: { size: ctx.size, expanded, hidden: !isBranch },
  });
  const { className: iconClass } = useThemedClasses({
    recipe: treeIconRecipe,
    componentName: 'TreeView',
    slot: 'icon',
    props: { size: ctx.size },
  });
  const { className: labelClass } = useThemedClasses({
    recipe: treeLabelRecipe,
    componentName: 'TreeView',
    slot: 'label',
    props: {},
  });
  const { className: asyncClass } = useThemedClasses({
    recipe: treeAsyncRecipe,
    componentName: 'TreeView',
    slot: 'async',
    props: { size: ctx.size },
  });
  const { className: errorClass } = useThemedClasses({
    recipe: treeErrorRecipe,
    componentName: 'TreeView',
    slot: 'error',
    props: { size: ctx.size },
  });

  const indentStyle: React.CSSProperties = {
    paddingInlineStart: ctx.indent * (level + 1) - ctx.indent + 8,
  };

  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    if (disabled) return;
    if ((event.target as HTMLElement).closest('[data-tree-stop-row-click]')) return;
    // Tree rows nest (`<li role="treeitem">` inside another). Stop here so the parent's
    // click handler doesn't also fire — otherwise expansion/selection bubbles up.
    event.stopPropagation();
    ctx.setFocus(node.id);
    if (isBranch && (event.target as HTMLElement).closest('[data-tree-chevron]')) {
      ctx.toggleExpanded(node.id);
      ctx.loadChildrenIfNeeded(node);
      return;
    }
    if (selectable && ctx.selectionMode !== 'none') {
      ctx.selectNode(node.id, event.ctrlKey || event.metaKey || event.shiftKey);
    } else if (isBranch) {
      ctx.toggleExpanded(node.id);
      ctx.loadChildrenIfNeeded(node);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (disabled) return;
    // Same nested-LI bubbling concern as click.
    event.stopPropagation();
    ctx.onKeyDown(event, node);
  };

  const renderState: TreeNodeRenderState = {
    level,
    expanded,
    selected,
    focused,
    disabled,
    hasChildren: isBranch,
    loading,
  };

  const visualIcon =
    node.icon ?? (isBranch ? (expanded ? ctx.expandedIcon : ctx.defaultIcon) : ctx.leafIcon);

  const labelNode =
    ctx.renderNode !== undefined
      ? ctx.renderNode(node, renderState)
      : (
          <>
            {visualIcon !== null && visualIcon !== undefined ? (
              <span aria-hidden="true" className={iconClass} data-tree-icon="">
                {visualIcon}
              </span>
            ) : null}
            <span id={labelId} className={labelClass} data-tree-label="">
              {node.label}
            </span>
          </>
        );

  return (
    <li
      ref={liRef}
      role="treeitem"
      aria-level={level + 1}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-expanded={isBranch ? expanded : undefined}
      aria-selected={
        ctx.selectionMode === 'none' || !selectable ? undefined : selected
      }
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      aria-labelledby={ctx.renderNode === undefined ? labelId : undefined}
      tabIndex={focused ? 0 : -1}
      data-tree-item=""
      data-level={level}
      data-selected={selected ? 'true' : undefined}
      data-focused={focused ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
      onFocus={(event) => {
        // Only react when this LI is the actual focus target (children bubble focus).
        if (event.target !== event.currentTarget) return;
        ctx.setFocus(node.id);
      }}
      onKeyDown={handleKeyDown}
      className="outline-none"
    >
      <div className={itemClass} style={indentStyle} data-tree-row="">
        <span
          className={chevronClass}
          data-tree-chevron={isBranch ? '' : undefined}
          aria-hidden="true"
        >
          <ChevronRight className="size-full" />
        </span>

        {ctx.showCheckboxes && ctx.selectionMode === 'multiple' && selectable ? (
          <span data-tree-stop-row-click="" className="inline-flex">
            <Checkbox
              checked={selected}
              disabled={disabled}
              onCheckedChange={() => ctx.selectNode(node.id, false)}
              aria-labelledby={labelId}
            />
          </span>
        ) : null}

        {labelNode}
      </div>

      {isBranch && expanded ? (
        <ul role="group" data-tree-group="">
          {loading ? (
            <li
              role="none"
              className={asyncClass}
              style={{ paddingInlineStart: ctx.indent * (level + 1) + 8 }}
              data-tree-loading=""
            >
              <Spinner size="sm" label={ctx.translations.loading} labelPlacement="hidden" />
              <span>{ctx.translations.loading}</span>
            </li>
          ) : error ? (
            <li
              role="none"
              className={errorClass}
              style={{ paddingInlineStart: ctx.indent * (level + 1) + 8 }}
            >
              <span>{ctx.translations.loadError}</span>
              <button
                type="button"
                data-tree-stop-row-click=""
                className="rounded-sm bg-bg-subtle px-1.5 py-0.5 text-xs hover:bg-bg-emphasis/30"
                onClick={(event) => {
                  event.stopPropagation();
                  ctx.loadChildrenIfNeeded(node);
                }}
              >
                {ctx.translations.retry}
              </button>
            </li>
          ) : Array.isArray(node.children) ? (
            node.children.map((child, idx) => (
              <TreeNodeView
                key={child.id}
                node={child}
                level={level + 1}
                posInSet={idx + 1}
                setSize={node.children!.length}
              />
            ))
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Compound Node                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Pure marker component for the compound API. It never renders directly — the root
 * walks its descendants once and converts them into `TreeNodeData[]`. We use a static
 * `__isTreeViewNode` flag rather than `name` matching because minifiers rewrite
 * function names in production builds.
 */
function TreeViewNode(_props: TreeViewNodeProps): ReactElement | null {
  return null;
}
(TreeViewNode as unknown as { __isTreeViewNode: boolean }).__isTreeViewNode = true;
TreeViewNode.displayName = 'TreeView.Node';

/* -------------------------------------------------------------------------- */
/*  Public export                                                             */
/* -------------------------------------------------------------------------- */

export const TreeView = Object.assign(TreeViewImpl, {
  Node: TreeViewNode,
});

export type { TreeNodeData };
