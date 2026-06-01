import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Div } from '../src/Div';
import { renderWithTheme as render } from './utils';

describe('Div — defaults', () => {
  it('renders a <div> by default', () => {
    render(<Div data-testid="d">hello</Div>);
    const node = screen.getByTestId('d');
    expect(node.tagName).toBe('DIV');
    expect(node.textContent).toBe('hello');
  });

  it('renders children verbatim', () => {
    render(
      <Div>
        <span data-testid="child">x</span>
      </Div>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('forwards ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(<Div ref={ref}>x</Div>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('emits no inline style when no style/sx/centered props are supplied', () => {
    render(<Div data-testid="d">x</Div>);
    const node = screen.getByTestId('d');
    expect(node.getAttribute('style')).toBeNull();
  });
});

describe('Div — style shorthand props', () => {
  it('emits a single inline style for shorthand props', () => {
    render(
      <Div data-testid="d" display="flex" p={4} flex={1}>
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.style.display).toBe('flex');
    expect(node.style.padding).toBe('4px');
    // CSSStyleDeclaration normalizes the `flex` shorthand into its `flex-grow flex-shrink
    // flex-basis` longhand on read, so we match the normalized form.
    expect(node.style.flex).toBe('1 1 0%');
  });

  it('expands sxToStyle aliases (m → margin, bg → backgroundColor, radius → borderRadius)', () => {
    render(
      <Div data-testid="d" m={8} bg="#fafafa" radius={6}>
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.style.margin).toBe('8px');
    expect(node.style.backgroundColor).toBe('rgb(250, 250, 250)');
    expect(node.style.borderRadius).toBe('6px');
  });

  it('resolves palette token strings to CSS vars', () => {
    render(
      <Div data-testid="d" bg="primary.main" fg="primary.contrast">
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.getAttribute('style') ?? '').toContain('--sds-palette-primary-main');
    expect(node.getAttribute('style') ?? '').toContain('--sds-palette-primary-contrast');
  });

  it('the explicit `style` prop wins over `sx` and curated shorthand', () => {
    render(
      <Div
        data-testid="d"
        bg="#ff0000"
        sx={{ backgroundColor: '#00ff00' }}
        style={{ backgroundColor: 'rgb(0, 0, 255)' }}
      >
        x
      </Div>,
    );
    expect(screen.getByTestId('d').style.backgroundColor).toBe('rgb(0, 0, 255)');
  });

  it('curated shorthand wins over `sx` (later in the cascade)', () => {
    render(
      <Div data-testid="d" sx={{ backgroundColor: '#00ff00' }} bg="#ff0000">
        x
      </Div>,
    );
    expect(screen.getByTestId('d').style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
});

describe('Div — centered shortcut', () => {
  it('injects flex + center cross + center main when set', () => {
    render(
      <Div data-testid="d" centered>
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.style.display).toBe('flex');
    expect(node.style.alignItems).toBe('center');
    expect(node.style.justifyContent).toBe('center');
  });

  it('explicit display wins over centered', () => {
    render(
      <Div data-testid="d" centered display="grid">
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.style.display).toBe('grid');
    // alignItems / justifyContent are still injected (we only override what's explicit).
    expect(node.style.alignItems).toBe('center');
    expect(node.style.justifyContent).toBe('center');
  });

  it('explicit alignItems/justifyContent both win over centered defaults', () => {
    render(
      <Div data-testid="d" centered alignItems="flex-start" justifyContent="space-between">
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.style.display).toBe('flex');
    expect(node.style.alignItems).toBe('flex-start');
    expect(node.style.justifyContent).toBe('space-between');
  });
});

describe('Div — hideOn / displayOn', () => {
  it('hideOn="md" emits md:hidden', () => {
    render(
      <Div data-testid="d" hideOn="md">
        x
      </Div>,
    );
    expect(screen.getByTestId('d').className).toContain('md:hidden');
  });

  it('hideOn covers every breakpoint', () => {
    const cases: Array<['sm' | 'md' | 'lg' | 'xl' | '2xl', string]> = [
      ['sm', 'sm:hidden'],
      ['md', 'md:hidden'],
      ['lg', 'lg:hidden'],
      ['xl', 'xl:hidden'],
      ['2xl', '2xl:hidden'],
    ];
    for (const [bp, expected] of cases) {
      const { unmount } = render(
        <Div data-testid={bp} hideOn={bp}>
          x
        </Div>,
      );
      expect(screen.getByTestId(bp).className).toContain(expected);
      unmount();
    }
  });

  it('displayOn="md" emits both `hidden` and `md:block`', () => {
    render(
      <Div data-testid="d" displayOn="md">
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).toContain('md:block');
    // `hidden` may be merged-away if consumer also passes `block` className, but on its own
    // it must be present.
    expect(cls.split(/\s+/)).toContain('hidden');
  });

  it('consumer className survives alongside recipe classes', () => {
    render(
      <Div data-testid="d" hideOn="md" className="custom-class">
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).toContain('md:hidden');
    expect(cls).toContain('custom-class');
  });
});

describe('Div — pseudo-state className hooks', () => {
  it('onHover prefixes every token', () => {
    render(
      <Div data-testid="d" onHover="bg-primary-100 scale-[1.02]">
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).toContain('hover:bg-primary-100');
    expect(cls).toContain('hover:scale-[1.02]');
  });

  it('onFocusVisible prefixes with focus-visible:', () => {
    render(
      <Div data-testid="d" onFocusVisible="ring-2 ring-primary-500">
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).toContain('focus-visible:ring-2');
    expect(cls).toContain('focus-visible:ring-primary-500');
  });

  it('multiple pseudo props compose without overwriting each other', () => {
    render(
      <Div
        data-testid="d"
        onHover="bg-primary-100"
        onActive="scale-[0.98]"
        onDisabled="opacity-50"
      >
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).toContain('hover:bg-primary-100');
    expect(cls).toContain('active:scale-[0.98]');
    expect(cls).toContain('disabled:opacity-50');
  });

  it('no pseudo prop set → no pseudo classes emitted', () => {
    render(
      <Div data-testid="d" hideOn="md">
        x
      </Div>,
    );
    const cls = screen.getByTestId('d').className;
    expect(cls).not.toContain('hover:');
    expect(cls).not.toContain('focus-visible:');
    expect(cls).not.toContain('active:');
  });
});

describe('Div — polymorphism', () => {
  it('as="section" renders a <section>', () => {
    render(
      <Div as="section" data-testid="s">
        x
      </Div>,
    );
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
  });

  it('actLike="button" renders a <button>', () => {
    render(
      <Div actLike="button" data-testid="b" type="button">
        x
      </Div>,
    );
    expect(screen.getByTestId('b').tagName).toBe('BUTTON');
  });

  it('actLike="a" renders an <a> with href passthrough', () => {
    render(
      <Div actLike="a" href="/docs" data-testid="a">
        x
      </Div>,
    );
    const a = screen.getByTestId('a');
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('href')).toBe('/docs');
  });

  it('actLike wins over as when both are set', () => {
    render(
      <Div as="section" actLike="article" data-testid="x">
        x
      </Div>,
    );
    expect(screen.getByTestId('x').tagName).toBe('ARTICLE');
  });

  it('asChild merges Div props onto the single child', () => {
    render(
      <Div asChild p={4} bg="#fafafa" className="ds-cls">
        <a href="/x" data-testid="child">
          link
        </a>
      </Div>,
    );
    const child = screen.getByTestId('child');
    expect(child.tagName).toBe('A');
    expect(child.getAttribute('href')).toBe('/x');
    expect(child.className).toContain('ds-cls');
    expect(child.style.padding).toBe('4px');
    expect(child.style.backgroundColor).toBe('rgb(250, 250, 250)');
  });
});

describe('Div — HTML pass-through', () => {
  it('id / role / aria-* / data-* flow to the rendered element', () => {
    render(
      <Div
        data-testid="d"
        id="hero"
        role="region"
        aria-label="Hero"
        data-section="hero"
      >
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.id).toBe('hero');
    expect(node.getAttribute('role')).toBe('region');
    expect(node.getAttribute('aria-label')).toBe('Hero');
    expect(node.getAttribute('data-section')).toBe('hero');
  });

  it('event handlers fire on the rendered element', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Div data-testid="d" onClick={onClick}>
        click
      </Div>,
    );
    await user.click(screen.getByTestId('d'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Div — animation', () => {
  it('animation="fadeIn" produces a motion-wrapped element that still renders inline-style + className', () => {
    render(
      <Div data-testid="d" animation="fadeIn" p={4} className="ds-anim">
        x
      </Div>,
    );
    const node = screen.getByTestId('d');
    // Motion renders the same intrinsic <div> with the preset's initial styles inlined.
    expect(node.tagName).toBe('DIV');
    expect(node.style.padding).toBe('4px');
    expect(node.className).toContain('ds-anim');
  });

  it('children render inside the animated element', () => {
    render(
      <Div animation="scaleIn">
        <span data-testid="child">x</span>
      </Div>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('Div — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when both `as` and `actLike` are set', () => {
    render(
      <Div as="section" actLike="article">
        x
      </Div>,
    );
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_AS_ACTLIKE/);
  });

  it('warns when `as` / `actLike` is combined with `asChild`', () => {
    render(
      <Div as="section" asChild>
        <a href="/x">x</a>
      </Div>,
    );
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_AS_ASCHILD/);
  });

  it('warns when `animation` is combined with `asChild`', () => {
    render(
      <Div asChild animation="fadeIn">
        <a href="/x">x</a>
      </Div>,
    );
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_ANIM_ASCHILD/);
  });
});