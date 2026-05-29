import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TreeView } from '../src/TreeView';
import type { TreeNodeData } from '../src/TreeView';
import { renderWithTheme as render } from './utils';

const flatData: TreeNodeData[] = [
  {
    id: 'animals',
    label: 'Animals',
    children: [
      { id: 'animals/cats', label: 'Cats' },
      { id: 'animals/dogs', label: 'Dogs' },
    ],
  },
  {
    id: 'colors',
    label: 'Colors',
    children: [
      { id: 'colors/red', label: 'Red' },
      { id: 'colors/blue', label: 'Blue' },
    ],
  },
];

describe('TreeView — rendering', () => {
  it('renders a root tree with each root node as a treeitem', () => {
    render(<TreeView ariaLabel="t" data={flatData} />);
    expect(screen.getByRole('tree', { name: 't' })).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
  });

  it('expands children when defaultExpanded includes their parent', () => {
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    expect(screen.getAllByRole('treeitem')).toHaveLength(4);
    expect(screen.getByRole('treeitem', { name: /Cats/ })).toBeInTheDocument();
  });

  it('sets aria-level + aria-posinset + aria-setsize correctly', () => {
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    expect(animals).toHaveAttribute('aria-level', '1');
    expect(animals).toHaveAttribute('aria-setsize', '2');
    const cats = screen.getByRole('treeitem', { name: /Cats/ });
    expect(cats).toHaveAttribute('aria-level', '2');
    expect(cats).toHaveAttribute('aria-setsize', '2');
  });

  it('marks the tree as multi-selectable when selectionMode=multiple', () => {
    render(<TreeView ariaLabel="t" data={flatData} selectionMode="multiple" />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
  });
});

describe('TreeView — compound API', () => {
  it('renders nodes declared via TreeView.Node', () => {
    render(
      <TreeView ariaLabel="t">
        <TreeView.Node id="a" label="A" defaultExpanded>
          <TreeView.Node id="a/1" label="A1" />
        </TreeView.Node>
        <TreeView.Node id="b" label="B" />
      </TreeView>,
    );
    expect(screen.getByRole('treeitem', { name: /A1/ })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: /B/ })).toBeInTheDocument();
  });

  it('wins over data when both are provided', () => {
    render(
      <TreeView ariaLabel="t" data={flatData}>
        <TreeView.Node id="only" label="Only Compound" />
      </TreeView>,
    );
    expect(screen.getByRole('treeitem', { name: 'Only Compound' })).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: /Animals/ })).not.toBeInTheDocument();
  });
});

describe('TreeView — expansion', () => {
  it('toggles aria-expanded when clicking the chevron', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    expect(animals).toHaveAttribute('aria-expanded', 'false');
    await user.click(animals.querySelector('[data-tree-chevron]') as HTMLElement);
    expect(animals).toHaveAttribute('aria-expanded', 'true');
  });

  it('fires onExpandedChange in controlled mode', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    function Wrapper() {
      const [expanded, setExpanded] = useState<string[]>([]);
      return (
        <TreeView
          ariaLabel="t"
          data={flatData}
          expanded={expanded}
          onExpandedChange={(next) => {
            onExpandedChange(next);
            setExpanded(next);
          }}
        />
      );
    }
    render(<Wrapper />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    await user.click(animals.querySelector('[data-tree-chevron]') as HTMLElement);
    expect(onExpandedChange).toHaveBeenLastCalledWith(['animals']);
  });
});

describe('TreeView — single selection', () => {
  it('selects on click in single mode', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [selected, setSelected] = useState<string>('');
      return (
        <>
          <output data-testid="signal">{selected}</output>
          <TreeView
            ariaLabel="t"
            data={flatData}
            defaultExpanded={['animals']}
            selectionMode="single"
            selected={selected}
            onSelect={setSelected}
          />
        </>
      );
    }
    render(<Wrapper />);
    await user.click(screen.getByRole('treeitem', { name: /Cats/ }));
    expect(screen.getByTestId('signal')).toHaveTextContent('animals/cats');
  });

  it('sets aria-selected on the selected node only', () => {
    render(
      <TreeView
        ariaLabel="t"
        data={flatData}
        defaultExpanded={['animals']}
        selectionMode="single"
        selected="animals/cats"
      />,
    );
    expect(screen.getByRole('treeitem', { name: /Cats/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: /Dogs/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});

describe('TreeView — multiple selection', () => {
  it('renders checkboxes when showCheckboxes is true', () => {
    render(
      <TreeView
        ariaLabel="t"
        data={flatData}
        defaultExpanded={['animals']}
        selectionMode="multiple"
        showCheckboxes
      />,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('toggles selection through the checkbox', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <>
          <output data-testid="signal">{selected.join(',')}</output>
          <TreeView
            ariaLabel="t"
            data={flatData}
            defaultExpanded={['animals']}
            selectionMode="multiple"
            showCheckboxes
            selected={selected}
            onSelectedChange={(next) => setSelected(next as string[])}
          />
        </>
      );
    }
    render(<Wrapper />);
    const checkbox = screen.getAllByRole('checkbox')[1]!; // Cats
    await user.click(checkbox);
    expect(screen.getByTestId('signal')).toHaveTextContent('animals/cats');
  });
});

describe('TreeView — disabled + selectable=false', () => {
  it('does not select disabled nodes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const data: TreeNodeData[] = [
      { id: 'x', label: 'X', disabled: true },
      { id: 'y', label: 'Y' },
    ];
    render(
      <TreeView ariaLabel="t" data={data} selectionMode="single" onSelect={onSelect} />,
    );
    await user.click(screen.getByRole('treeitem', { name: 'X' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not select selectable=false nodes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const data: TreeNodeData[] = [
      { id: 'h', label: 'Header', selectable: false, children: [{ id: 'h/1', label: 'Child' }] },
    ];
    render(
      <TreeView
        ariaLabel="t"
        data={data}
        defaultExpanded={['h']}
        selectionMode="single"
        onSelect={onSelect}
      />,
    );
    // Selectable child still fires onSelect normally.
    await user.click(screen.getByRole('treeitem', { name: /Child/ }));
    expect(onSelect).toHaveBeenLastCalledWith('h/1');
    // Header (non-selectable branch) does not fire onSelect even though it toggles expansion.
    onSelect.mockClear();
    await user.click(
      screen
        .getByRole('treeitem', { name: /Header/ })
        .querySelector('[data-tree-chevron]') as HTMLElement,
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('TreeView — keyboard', () => {
  it('ArrowDown moves focus to the next visible node', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    animals.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: /Cats/ })).toHaveFocus();
  });

  it('ArrowRight on a collapsed branch expands it', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    animals.focus();
    await user.keyboard('{ArrowRight}');
    expect(animals).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowLeft on an expanded branch collapses it', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    animals.focus();
    await user.keyboard('{ArrowLeft}');
    expect(animals).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowLeft on a child focuses its parent', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    const cats = screen.getByRole('treeitem', { name: /Cats/ });
    cats.focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', { name: /Animals/ })).toHaveFocus();
  });

  it('Home / End jump to the first / last visible node', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals']} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    animals.focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('treeitem', { name: /Colors/ })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('treeitem', { name: /Animals/ })).toHaveFocus();
  });

  it('Enter selects the focused node in single mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TreeView
        ariaLabel="t"
        data={flatData}
        defaultExpanded={['animals']}
        onSelect={onSelect}
      />,
    );
    const cats = screen.getByRole('treeitem', { name: /Cats/ });
    cats.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('animals/cats');
  });

  it('typeahead jumps focus to a matching label', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} defaultExpanded={['animals', 'colors']} />);
    screen.getByRole('treeitem', { name: /Animals/ }).focus();
    await user.keyboard('r');
    expect(screen.getByRole('treeitem', { name: /Red/ })).toHaveFocus();
  });

  it('* expands all sibling branches of the focused node', async () => {
    const user = userEvent.setup();
    render(<TreeView ariaLabel="t" data={flatData} />);
    const animals = screen.getByRole('treeitem', { name: /Animals/ });
    animals.focus();
    await user.keyboard('{*}');
    expect(animals).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: /Colors/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('Ctrl+A selects all visible nodes in multi mode', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <TreeView
        ariaLabel="t"
        data={flatData}
        defaultExpanded={['animals']}
        selectionMode="multiple"
        onSelectedChange={onSelectedChange}
      />,
    );
    screen.getByRole('treeitem', { name: /Animals/ }).focus();
    await user.keyboard('{Control>}a{/Control}');
    const last = onSelectedChange.mock.calls.at(-1)?.[0] as string[];
    expect(new Set(last)).toEqual(new Set(['animals', 'animals/cats', 'animals/dogs', 'colors']));
  });
});

describe('TreeView — async loadChildren', () => {
  it('resolves children when expanding an async branch', async () => {
    const loadChildren = vi.fn().mockResolvedValue([
      { id: 'async/1', label: 'Async child' },
    ]);
    const data: TreeNodeData[] = [{ id: 'async', label: 'Async', hasChildren: true }];
    render(<TreeView ariaLabel="t" data={data} loadChildren={loadChildren} />);
    const branch = screen.getByRole('treeitem', { name: /Async/ });
    await act(async () => {
      fireEvent.click(branch.querySelector('[data-tree-chevron]') as HTMLElement);
    });
    await waitFor(() => {
      expect(screen.getByText('Async child')).toBeInTheDocument();
    });
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it('shows the loading sentinel during the in-flight call', async () => {
    let resolve: ((value: TreeNodeData[]) => void) | undefined;
    const loadChildren = vi.fn(
      () => new Promise<TreeNodeData[]>((r) => { resolve = r; }),
    );
    const data: TreeNodeData[] = [{ id: 'lazy', label: 'Lazy', hasChildren: true }];
    render(<TreeView ariaLabel="t" data={data} loadChildren={loadChildren} />);
    const branch = screen.getByRole('treeitem', { name: /Lazy/ });
    await act(async () => {
      fireEvent.click(branch.querySelector('[data-tree-chevron]') as HTMLElement);
    });
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    await act(async () => {
      resolve?.([{ id: 'lazy/1', label: 'Resolved' }]);
    });
    await waitFor(() => expect(screen.getByText('Resolved')).toBeInTheDocument());
  });
});

describe('TreeView — translations override', () => {
  it('uses the consumer-provided loading label', async () => {
    let resolve: ((value: TreeNodeData[]) => void) | undefined;
    const loadChildren = vi.fn(
      () => new Promise<TreeNodeData[]>((r) => { resolve = r; }),
    );
    const data: TreeNodeData[] = [{ id: 'x', label: 'X', hasChildren: true }];
    render(
      <TreeView
        ariaLabel="t"
        data={data}
        loadChildren={loadChildren}
        translations={{ loading: 'טוען' }}
      />,
    );
    const branch = screen.getByRole('treeitem', { name: /X/ });
    await act(async () => {
      fireEvent.click(branch.querySelector('[data-tree-chevron]') as HTMLElement);
    });
    expect(screen.getByText('טוען')).toBeInTheDocument();
    await act(async () => {
      resolve?.([]);
    });
  });
});
