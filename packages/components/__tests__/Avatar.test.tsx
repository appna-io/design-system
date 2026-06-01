import { screen, waitFor } from '@testing-library/react';
import { act, createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Avatar } from '../src/Avatar/Avatar';
import { hashColor } from '../src/Avatar/hashColor';
import { getInitials } from '../src/Avatar/initials';
import { renderWithTheme as render } from './utils';

const HASHABLE_COLORS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const;

const VARIANTS = ['solid', 'outline', 'soft'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
const SHAPES = ['circle', 'rounded', 'square'] as const;
const STATUS_PLACEMENTS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;

// jsdom's HTMLImageElement does not fire load/error from `image.src = …`. We patch a deterministic
// constructor so the state-machine effects can be exercised. Each test that needs image traffic
// flips `mockImageOutcome` before triggering Avatar to render.
type MockOutcome = 'load' | 'error' | 'pending';
let mockImageOutcome: MockOutcome = 'load';
const originalImage = window.Image;

beforeEach(() => {
  mockImageOutcome = 'load';
  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _src = '';
    addEventListener(event: string, handler: () => void) {
      if (event === 'load') this.onload = handler;
      if (event === 'error') this.onerror = handler;
    }
    removeEventListener(event: string) {
      if (event === 'load') this.onload = null;
      if (event === 'error') this.onerror = null;
    }
    set src(value: string) {
      this._src = value;
      // Fire microtask-async so React commits before the listener is invoked.
      queueMicrotask(() => {
        if (mockImageOutcome === 'load') this.onload?.();
        if (mockImageOutcome === 'error') this.onerror?.();
      });
    }
    get src() {
      return this._src;
    }
  }
  // @ts-expect-error — overriding for jsdom.
  window.Image = MockImage;
});

afterEach(() => {
  window.Image = originalImage;
});

describe('hashColor — pure', () => {
  it('returns "neutral" for undefined / empty', () => {
    expect(hashColor(undefined)).toBe('neutral');
    expect(hashColor('')).toBe('neutral');
  });

  it('is deterministic — same name → same color across calls', () => {
    expect(hashColor('Ada Lovelace')).toBe(hashColor('Ada Lovelace'));
    expect(hashColor('A')).toBe(hashColor('A'));
  });

  it('lands inside the seven-role palette', () => {
    const sample = ['Ada', 'Bren', 'Cleo', 'Dax', 'Eli', 'Fae', 'Gigi', 'Hugo', 'Ivy'];
    for (const name of sample) {
      expect(HASHABLE_COLORS).toContain(hashColor(name));
    }
  });

  it('covers the palette distribution when fed enough varied names', () => {
    const seen = new Set<string>();
    // 200 alphabetic strings should comfortably hit every bucket via mod 7.
    for (let i = 0; i < 200; i++) {
      seen.add(hashColor(String.fromCharCode(65 + (i % 26)).repeat(1 + (i % 5))));
    }
    // Distribution test is generous on purpose; sum-mod-7 doesn't guarantee uniformity but
    // realistic inputs always touch ≥4 buckets within 200 samples.
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });
});

describe('getInitials — pure', () => {
  it('returns "" for empty / undefined', () => {
    expect(getInitials(undefined)).toBe('');
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });

  it('takes the first letter for a single-word name', () => {
    expect(getInitials('Ada')).toBe('A');
    expect(getInitials('ada')).toBe('A');
  });

  it('takes first + last initial for a multi-word name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('Mary Anne Smith')).toBe('MS');
  });

  it('passes through AvatarGroup "+N" overflow markers verbatim', () => {
    expect(getInitials('+3')).toBe('+3');
    expect(getInitials('+12')).toBe('+12');
  });

  it('does not treat strings starting with "+" as overflow when they have non-digits', () => {
    expect(getInitials('+Ada Lovelace')).toBe('+L');
  });

  it('handles surrogate-pair codepoints (emoji, CJK) without splitting them', () => {
    expect(getInitials('😀 笑')).toBe('😀笑');
  });
});

describe('Avatar — fallback rendering (no src)', () => {
  it('renders a span with role=img and an aria-label derived from name', () => {
    render(<Avatar name="Ada Lovelace" />);
    const node = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(node.tagName).toBe('SPAN');
  });

  it('renders initials text for a name-only avatar', () => {
    render(<Avatar name="Ada Lovelace" delayMs={0} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders the default icon fallback when there is no name', () => {
    const { container } = render(<Avatar delayMs={0} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'avatar' })).toBeInTheDocument();
  });

  it('renders a custom fallbackIcon when neither src nor name is provided', () => {
    render(
      <Avatar delayMs={0} fallbackIcon={<span data-testid="custom-icon">★</span>} />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('alt overrides the auto-derived aria-label', () => {
    render(<Avatar name="Ada Lovelace" alt="Profile of Ada" />);
    expect(screen.getByRole('img', { name: 'Profile of Ada' })).toBeInTheDocument();
  });

  it('aria-label prop overrides alt + name', () => {
    render(<Avatar name="Ada" alt="ignored" aria-label="explicit" />);
    expect(screen.getByRole('img', { name: 'explicit' })).toBeInTheDocument();
  });
});

describe('Avatar — variant × color matrix', () => {
  it('solid variant uses opaque palette fill + contrast text', () => {
    for (const color of HASHABLE_COLORS) {
      const { unmount } = render(
        <Avatar variant="solid" color={color} name="X" />,
      );
      const node = screen.getByRole('img');
      expect(node.className).toContain(`bg-${color}`);
      expect(node.className).toContain(`text-${color}-contrast`);
      unmount();
    }
  });

  it('outline variant uses paper bg + role border + role text for every color', () => {
    for (const color of HASHABLE_COLORS) {
      const { unmount } = render(
        <Avatar variant="outline" color={color} name="X" />,
      );
      const node = screen.getByRole('img');
      expect(node.className).toContain('bg-bg-paper');
      expect(node.className).toContain(`border-${color}`);
      expect(node.className).toContain(`text-${color}`);
      unmount();
    }
  });

  it('soft variant uses role -subtle bg + role text', () => {
    for (const color of HASHABLE_COLORS) {
      const { unmount } = render(<Avatar variant="soft" color={color} name="X" />);
      const node = screen.getByRole('img');
      expect(node.className).toContain(`bg-${color}-subtle`);
      expect(node.className).toContain(`text-${color}`);
      unmount();
    }
  });

  it('color="auto" resolves deterministically to a palette role', () => {
    // Same name → identical data-color across remounts.
    const first = render(<Avatar name="Ada Lovelace" />);
    const firstColor = first.getByRole('img').getAttribute('data-color');
    first.unmount();
    const second = render(<Avatar name="Ada Lovelace" />);
    expect(second.getByRole('img').getAttribute('data-color')).toBe(firstColor);
    expect(HASHABLE_COLORS).toContain(firstColor);
  });

  it('applies the right size + shape classes', () => {
    for (const size of SIZES) {
      for (const shape of SHAPES) {
        const { unmount } = render(<Avatar size={size} shape={shape} name="X" />);
        const node = screen.getByRole('img');
        const expectedShape = {
          circle: 'rounded-full',
          rounded: 'rounded-lg',
          square: 'rounded-none',
        }[shape];
        expect(node.className).toContain(expectedShape);
        unmount();
      }
    }
  });

  it('every variant ships data-variant on the root for QA hooks', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Avatar variant={variant} name="X" />);
      expect(screen.getByRole('img')).toHaveAttribute('data-variant', variant);
      unmount();
    }
  });
});

describe('Avatar — ring', () => {
  it('applies the ring classes when ring is not "none"', () => {
    render(<Avatar name="X" ring="primary" />);
    const node = screen.getByRole('img');
    expect(node.className).toContain('ring-2');
    expect(node.className).toContain('ring-primary');
  });

  it('omits ring classes when ring="none"', () => {
    render(<Avatar name="X" />);
    expect(screen.getByRole('img').className).not.toMatch(/(^| )ring-2( |$)/);
  });
});

describe('Avatar — status indicator', () => {
  it('renders a status dot when status is set', () => {
    const { container } = render(<Avatar name="X" status="online" />);
    expect(container.querySelector('[data-status="online"]')).not.toBeNull();
  });

  it('the status dot carries the right tone class', () => {
    const { container } = render(<Avatar name="X" status="busy" />);
    const dot = container.querySelector('[data-status="busy"]') as HTMLElement;
    expect(dot.className).toContain('bg-danger');
    // busy pulses
    expect(dot.className).toContain('animate-badge-pulse');
  });

  it('positions the status dot per statusPlacement', () => {
    for (const placement of STATUS_PLACEMENTS) {
      const { container, unmount } = render(
        <Avatar name="X" status="online" statusPlacement={placement} />,
      );
      const dot = container.querySelector('[data-status="online"]') as HTMLElement;
      // Each placement uses one corner anchor (top-0/right-0/bottom-0/left-0).
      if (placement.startsWith('top')) expect(dot.className).toContain('top-0');
      if (placement.startsWith('bottom')) expect(dot.className).toContain('bottom-0');
      if (placement.endsWith('right')) expect(dot.className).toContain('right-0');
      if (placement.endsWith('left')) expect(dot.className).toContain('left-0');
      unmount();
    }
  });

  it('marks the status dot aria-hidden — it is decorative', () => {
    const { container } = render(<Avatar name="X" status="online" />);
    expect(container.querySelector('[data-status="online"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});

describe('Avatar — image state machine', () => {
  it('shows the image once it loads (data-loaded=true)', async () => {
    mockImageOutcome = 'load';
    render(<Avatar src="https://example.com/me.png" name="Ada" />);
    await waitFor(() =>
      expect(screen.getByRole('img').getAttribute('data-loaded')).toBe('true'),
    );
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('falls back to initials when the image errors', async () => {
    mockImageOutcome = 'error';
    render(<Avatar src="https://example.com/missing.png" name="Ada Lovelace" delayMs={0} />);
    await waitFor(() => {
      expect(screen.getByText('AL')).toBeInTheDocument();
    });
    expect(screen.getByRole('img').getAttribute('data-loaded')).not.toBe('true');
  });

  it('debounces the fallback by delayMs before painting', async () => {
    vi.useFakeTimers();
    mockImageOutcome = 'pending';
    render(<Avatar src="https://example.com/slow.png" name="Ada Lovelace" delayMs={200} />);

    // Right after mount: image is loading, debounce active → no fallback yet.
    expect(screen.queryByText('AL')).not.toBeInTheDocument();

    // After the debounce window, the fallback paints (image still pending).
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText('AL')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('delayMs=0 paints the fallback immediately', () => {
    mockImageOutcome = 'pending';
    render(<Avatar src="https://example.com/x.png" name="Ada Lovelace" delayMs={0} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });
});

describe('Avatar — asChild polymorphism', () => {
  it('renders the wrapped element with merged className and forwarded ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Avatar
        asChild
        ref={ref as unknown as React.Ref<HTMLSpanElement>}
        className="custom"
        name="Ada Lovelace"
      >
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Slot injects the avatar's
            fallback initials into this anchor at render time. */}
        <a href="#profile" />
      </Avatar>,
    );
    // With asChild, the wrapped element's native role wins (here: link). The Avatar's
    // accessible name still rides along via aria-label.
    const link = screen.getByRole('link', { name: 'Ada Lovelace' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('custom');
    expect(link).toHaveAttribute('href', '#profile');
    expect(ref.current?.tagName).toBe('A');
  });

  it('renders the avatar fallback content inside the wrapped element', () => {
    render(
      <Avatar asChild name="Ada Lovelace">
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Slot injects content. */}
        <a href="#profile" />
      </Avatar>,
    );
    const link = screen.getByRole('link');
    // initials live inside the link
    expect(link.textContent).toContain('AL');
  });
});

describe('Avatar — overrides + refs', () => {
  it('className wins over conflicting recipe classes via tailwind-merge', () => {
    render(<Avatar name="X" className="rounded-none" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-none');
    expect(screen.getByRole('img')).not.toHaveClass('rounded-full');
  });

  it('forwards ref to the underlying span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="X" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});