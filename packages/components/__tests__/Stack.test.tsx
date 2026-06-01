import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HStack, Spacer, Stack, VStack } from '../src/Stack';
import { renderWithTheme as render } from './utils';

const DIRECTIONS = ['column', 'column-reverse', 'row', 'row-reverse'] as const;
const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
const GAPS = [0, 'px', 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const;

const DIRECTION_CLASS: Record<(typeof DIRECTIONS)[number], string> = {
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
};

const ALIGN_CLASS: Record<(typeof ALIGNS)[number], string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY_CLASS: Record<(typeof JUSTIFIES)[number], string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

describe('Stack — defaults', () => {
  it('renders a <div> with the default flex + axis classes', () => {
    render(<Stack data-testid="stack">x</Stack>);
    const root = screen.getByTestId('stack');
    expect(root.tagName).toBe('DIV');
    expect(root.className).toContain('flex');
    expect(root.className).not.toContain('inline-flex');
    expect(root.className).toContain('flex-col');
    expect(root.className).toContain('items-stretch');
    expect(root.className).toContain('justify-start');
    expect(root.className).toContain('flex-nowrap');
  });

  it('forwards ref to the rendered element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack ref={ref as never} data-testid="stack">
        x
      </Stack>,
    );
    expect(ref.current).toBe(screen.getByTestId('stack'));
  });

  it('forwards arbitrary props (data-* / aria-*)', () => {
    render(
      <Stack data-testid="stack" data-custom="yes" aria-label="thing">
        x
      </Stack>,
    );
    const root = screen.getByTestId('stack');
    expect(root).toHaveAttribute('data-custom', 'yes');
    expect(root).toHaveAttribute('aria-label', 'thing');
  });

  it('merges className via tailwind-merge', () => {
    render(
      <Stack className="bg-red-500" data-testid="stack">
        x
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).toContain('bg-red-500');
  });
});

describe('Stack — axis classes', () => {
  it.each(DIRECTIONS)('direction="%s" emits the matching class', (direction) => {
    render(
      <Stack direction={direction} data-testid={`stack-${direction}`}>
        x
      </Stack>,
    );
    expect(screen.getByTestId(`stack-${direction}`).className).toContain(
      DIRECTION_CLASS[direction],
    );
  });

  it.each(ALIGNS)('align="%s" emits the matching class', (align) => {
    render(
      <Stack align={align} data-testid={`stack-${align}`}>
        x
      </Stack>,
    );
    expect(screen.getByTestId(`stack-${align}`).className).toContain(ALIGN_CLASS[align]);
  });

  it.each(JUSTIFIES)('justify="%s" emits the matching class', (justify) => {
    render(
      <Stack justify={justify} data-testid={`stack-${justify}`}>
        x
      </Stack>,
    );
    expect(screen.getByTestId(`stack-${justify}`).className).toContain(JUSTIFY_CLASS[justify]);
  });

  it('wrap=true emits flex-wrap; wrap="reverse" emits flex-wrap-reverse', () => {
    render(
      <Stack wrap data-testid="wrap">
        x
      </Stack>,
    );
    render(
      <Stack wrap="reverse" data-testid="wrap-reverse">
        x
      </Stack>,
    );
    expect(screen.getByTestId('wrap').className).toContain('flex-wrap');
    expect(screen.getByTestId('wrap-reverse').className).toContain('flex-wrap-reverse');
  });

  it('inline=true swaps flex → inline-flex', () => {
    render(
      <Stack inline data-testid="inline">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('inline').className;
    expect(cls).toContain('inline-flex');
    expect(cls).not.toMatch(/(?:^|\s)flex(?:\s|$)/);
  });

  it('fullWidth=true emits w-full', () => {
    render(
      <Stack fullWidth data-testid="fw">
        x
      </Stack>,
    );
    expect(screen.getByTestId('fw').className).toContain('w-full');
  });
});

describe('Stack — responsive values (cv native)', () => {
  it('direction={{ base: "column", md: "row" }} emits flex-col md:flex-row', () => {
    render(
      <Stack direction={{ base: 'column', md: 'row' }} data-testid="r-dir">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('r-dir').className;
    expect(cls).toContain('flex-col');
    expect(cls).toContain('md:flex-row');
  });

  it('gap={{ base: 2, md: 4 }} emits gap-2 md:gap-4', () => {
    render(
      <Stack gap={{ base: 2, md: 4 }} data-testid="r-gap">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('r-gap').className;
    expect(cls).toContain('gap-2');
    expect(cls).toContain('md:gap-4');
  });
});

describe('Stack — gap family', () => {
  it.each(GAPS)('gap=%s emits the matching gap-* class', (gap) => {
    render(
      <Stack gap={gap} data-testid={`g-${gap}`}>
        x
      </Stack>,
    );
    const expected = gap === 'px' ? 'gap-px' : `gap-${gap}`;
    expect(screen.getByTestId(`g-${gap}`).className).toContain(expected);
  });

  it('rowGap alone emits gap-y-*', () => {
    render(
      <Stack rowGap={4} data-testid="rg">
        x
      </Stack>,
    );
    expect(screen.getByTestId('rg').className).toContain('gap-y-4');
  });

  it('columnGap alone emits gap-x-*', () => {
    render(
      <Stack columnGap={4} data-testid="cg">
        x
      </Stack>,
    );
    expect(screen.getByTestId('cg').className).toContain('gap-x-4');
  });

  it('gap + rowGap → gap-x-{gap} gap-y-{rowGap} (no unified gap-*)', () => {
    render(
      <Stack gap={2} rowGap={4} data-testid="mix">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('mix').className;
    expect(cls).toContain('gap-x-2');
    expect(cls).toContain('gap-y-4');
    expect(cls).not.toMatch(/(?:^|\s)gap-2(?:\s|$)/);
  });

  it('gap + columnGap → gap-y-{gap} gap-x-{columnGap}', () => {
    render(
      <Stack gap={2} columnGap={4} data-testid="mix2">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('mix2').className;
    expect(cls).toContain('gap-y-2');
    expect(cls).toContain('gap-x-4');
  });

  it('rowGap + columnGap (no gap) emits both axis-only forms', () => {
    render(
      <Stack rowGap={1} columnGap={2} data-testid="split">
        x
      </Stack>,
    );
    const cls = screen.getByTestId('split').className;
    expect(cls).toContain('gap-y-1');
    expect(cls).toContain('gap-x-2');
  });
});

describe('Stack — divider insertion', () => {
  it('inserts the divider between adjacent non-Spacer siblings (n−1 dividers for n children)', () => {
    render(
      <Stack divider={<hr data-testid="div" />} data-testid="root">
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Stack>,
    );
    expect(screen.getAllByTestId('div')).toHaveLength(2);
  });

  it('skips dividers adjacent to a Spacer', () => {
    render(
      <Stack divider={<hr data-testid="div" />} data-testid="root">
        <span>a</span>
        <Spacer />
        <span>b</span>
      </Stack>,
    );
    // Spacer touches both edges; no divider should appear.
    expect(screen.queryAllByTestId('div')).toHaveLength(0);
  });

  it('omits dividers entirely when only one child', () => {
    render(
      <Stack divider={<hr data-testid="div" />}>
        <span>only</span>
      </Stack>,
    );
    expect(screen.queryAllByTestId('div')).toHaveLength(0);
  });

  it('filters falsy children before computing divider positions', () => {
    render(
      <Stack divider={<hr data-testid="div" />}>
        <span>a</span>
        {false}
        {null}
        <span>b</span>
      </Stack>,
    );
    // Falsy children shouldn't add phantom divider slots.
    expect(screen.getAllByTestId('div')).toHaveLength(1);
  });

  it('renders divider as Fragment when the node is a primitive', () => {
    render(
      <Stack divider="·" data-testid="root">
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Stack>,
    );
    expect(screen.getByTestId('root').textContent).toBe('a·b·c');
  });
});

describe('Stack — polymorphism', () => {
  it('as="ul" renders a <ul>', () => {
    render(
      <Stack as="ul" data-testid="list">
        <li>a</li>
      </Stack>,
    );
    expect(screen.getByTestId('list').tagName).toBe('UL');
  });

  it('as="nav" renders a <nav>', () => {
    render(
      <Stack as="nav" data-testid="nav">
        x
      </Stack>,
    );
    expect(screen.getByTestId('nav').tagName).toBe('NAV');
  });

  it('asChild forwards the className onto the wrapped child element', () => {
    render(
      <Stack asChild gap={2} data-testid="link">
        <a href="/x">link</a>
      </Stack>,
    );
    const a = screen.getByTestId('link');
    expect(a.tagName).toBe('A');
    expect(a).toHaveAttribute('href', '/x');
    expect(a.className).toContain('gap-2');
    expect(a.className).toContain('flex');
  });
});

describe('HStack / VStack — locked direction', () => {
  it('HStack locks direction="row"', () => {
    render(<HStack data-testid="h">x</HStack>);
    const cls = screen.getByTestId('h').className;
    expect(cls).toContain('flex-row');
    expect(cls).not.toContain('flex-col');
  });

  it('VStack locks direction="column"', () => {
    render(<VStack data-testid="v">x</VStack>);
    const cls = screen.getByTestId('v').className;
    expect(cls).toContain('flex-col');
    expect(cls).not.toContain('flex-row');
  });

  it('HStack forwards gap / align / justify / wrap', () => {
    render(
      <HStack gap={4} align="center" justify="between" data-testid="h">
        x
      </HStack>,
    );
    const cls = screen.getByTestId('h').className;
    expect(cls).toContain('gap-4');
    expect(cls).toContain('items-center');
    expect(cls).toContain('justify-between');
  });

  it('VStack forwards ref + accepts polymorphism via as', () => {
    const ref = createRef<HTMLElement>();
    render(
      <VStack ref={ref} as="section" data-testid="v">
        x
      </VStack>,
    );
    expect(screen.getByTestId('v').tagName).toBe('SECTION');
    expect(ref.current).toBe(screen.getByTestId('v'));
  });
});

describe('Spacer', () => {
  it('renders flex-1 + aria-hidden when no size is set (greedy mode)', () => {
    render(<Spacer data-testid="s" />);
    const s = screen.getByTestId('s');
    expect(s.className).toContain('flex-1');
    expect(s).toHaveAttribute('aria-hidden', 'true');
    expect(s).toHaveAttribute('data-sds-spacer', 'true');
  });

  it('renders fixed inline size by default (axis="auto")', () => {
    render(<Spacer size={4} data-testid="s" />);
    const cls = screen.getByTestId('s').className;
    expect(cls).toContain('w-4');
    expect(cls).not.toContain('flex-1');
  });

  it('axis="block" pins fixed size to height', () => {
    render(<Spacer size={6} axis="block" data-testid="s" />);
    expect(screen.getByTestId('s').className).toContain('h-6');
  });

  it('axis="inline" pins fixed size to width', () => {
    render(<Spacer size={6} axis="inline" data-testid="s" />);
    expect(screen.getByTestId('s').className).toContain('w-6');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spacer ref={ref} data-testid="s" />);
    expect(ref.current).toBe(screen.getByTestId('s'));
  });

  it('carries the __sds_spacer marker on the component value', () => {
    // The marker is what `stackChildrenWithDivider` reads to skip dividers adjacent to Spacers.
    expect(
      (Spacer as unknown as { __sds_spacer?: boolean }).__sds_spacer,
    ).toBe(true);
  });
});

describe('Stack — dev-mode `as` + `asChild` guard', () => {
  it('warns when both are provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Stack as="ul" asChild data-testid="x">
        <ol />
      </Stack>,
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Stack]'));
    spy.mockRestore();
  });
});