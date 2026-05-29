import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { TreeView } from '../src/TreeView';
import type { TreeNodeData } from '../src/TreeView';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const data: TreeNodeData[] = [
  {
    id: 'a',
    label: 'Animals',
    children: [
      { id: 'a/cats', label: 'Cats' },
      { id: 'a/dogs', label: 'Dogs', disabled: true },
    ],
  },
  {
    id: 'b',
    label: 'Bands',
    selectable: false,
    children: [
      { id: 'b/abba', label: 'Abba' },
      { id: 'b/queen', label: 'Queen' },
    ],
  },
];

describe('TreeView — a11y', () => {
  it('default rendering has no violations', async () => {
    const { container } = render(<TreeView ariaLabel="t" data={data} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('expanded state has no violations', async () => {
    const { container } = render(
      <TreeView ariaLabel="t" data={data} defaultExpanded={['a', 'b']} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('single selection has no violations', async () => {
    const { container } = render(
      <TreeView
        ariaLabel="t"
        data={data}
        defaultExpanded={['a']}
        selectionMode="single"
        selected="a/cats"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('multiple selection with checkboxes has no violations', async () => {
    const { container } = render(
      <TreeView
        ariaLabel="t"
        data={data}
        defaultExpanded={['a', 'b']}
        selectionMode="multiple"
        showCheckboxes
        selected={['a/cats']}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled nodes have no violations', async () => {
    const { container } = render(
      <TreeView ariaLabel="t" data={data} defaultExpanded={['a']} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('compound API has no violations', async () => {
    const { container } = render(
      <TreeView ariaLabel="t">
        <TreeView.Node id="x" label="X" defaultExpanded>
          <TreeView.Node id="x/1" label="X1" />
          <TreeView.Node id="x/2" label="X2" />
        </TreeView.Node>
        <TreeView.Node id="y" label="Y" />
      </TreeView>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('non-selectable parents + children have no violations', async () => {
    const { container } = render(
      <TreeView
        ariaLabel="t"
        data={data}
        defaultExpanded={['b']}
        selectionMode="single"
        selected="b/abba"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('custom renderNode has no violations', async () => {
    const { container } = render(
      <TreeView
        ariaLabel="t"
        data={data}
        defaultExpanded={['a']}
        renderNode={(node) => <span>👉 {node.label}</span>}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('selectionMode=none with branches has no violations', async () => {
    const { container } = render(
      <TreeView ariaLabel="t" data={data} defaultExpanded={['a', 'b']} selectionMode="none" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('size variations have no violations', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container } = render(
        <TreeView ariaLabel={size} data={data} defaultExpanded={['a']} size={size} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
