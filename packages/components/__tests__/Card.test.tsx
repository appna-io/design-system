import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../src/Card';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['outline', 'solid', 'elevated', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SHAPES = ['rounded', 'square', 'pill'] as const;
const FOOTER_ALIGNS = ['start', 'center', 'end', 'between'] as const;

describe('Card — rendering', () => {
  it('renders a <div> root with children', () => {
    render(
      <Card data-testid="card">
        <Card.Body>Hello</Card.Body>
      </Card>,
    );
    const root = screen.getByTestId('card');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveTextContent('Hello');
  });

  it('applies default outline variant (border + paper bg)', () => {
    render(<Card data-testid="card">x</Card>);
    const root = screen.getByTestId('card');
    expect(root.className).toContain('border');
    expect(root.className).toContain('bg-bg-paper');
  });

  it.each(VARIANTS)('renders %s variant with matching surface classes', (variant) => {
    render(
      <Card data-testid={`card-${variant}`} variant={variant}>
        x
      </Card>,
    );
    const root = screen.getByTestId(`card-${variant}`);
    if (variant === 'elevated') expect(root.className).toContain('shadow-md');
    if (variant === 'solid') expect(root.className).toContain('bg-bg-subtle');
    if (variant === 'outline') expect(root.className).toContain('bg-bg-paper');
    if (variant === 'ghost') expect(root.className).toContain('bg-transparent');
  });

  it.each(SHAPES)('renders %s shape with the expected radius class', (shape) => {
    render(
      <Card data-testid={`card-${shape}`} shape={shape}>
        x
      </Card>,
    );
    const root = screen.getByTestId(`card-${shape}`);
    if (shape === 'rounded') expect(root.className).toContain('rounded-lg');
    if (shape === 'square') expect(root.className).toContain('rounded-none');
    if (shape === 'pill') expect(root.className).toContain('rounded-2xl');
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} data-testid="card">
        x
      </Card>,
    );
    expect(ref.current).toBe(screen.getByTestId('card'));
  });

  it('merges className via tailwind-merge (consumer wins)', () => {
    render(
      <Card className="bg-red-500" data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    expect(root.className).toContain('bg-red-500');
  });
});

describe('Card — interactivity', () => {
  it('clickable cards expose role=button + tabIndex=0', () => {
    render(
      <Card clickable data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    expect(root).toHaveAttribute('role', 'button');
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it('non-clickable cards do not get a role or tabIndex', () => {
    render(<Card data-testid="card">x</Card>);
    const root = screen.getByTestId('card');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
  });

  it('fires onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(
      <Card clickable onClick={handleClick} data-testid="card">
        x
      </Card>,
    );
    await userEvent.click(screen.getByTestId('card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('activates on Enter and Space when clickable + focused', async () => {
    const handleClick = vi.fn();
    render(
      <Card clickable onClick={handleClick} data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    root.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('does NOT activate on Enter/Space when not clickable', async () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick} data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    root.focus();
    await userEvent.keyboard('{Enter}');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('blocks clicks + sets aria-disabled when disabled', async () => {
    const handleClick = vi.fn();
    render(
      <Card clickable disabled onClick={handleClick} data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(root);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('emits data-selected when selected', () => {
    render(
      <Card selected data-testid="card">
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-selected', 'true');
  });

  it('emits data-hoverable / data-clickable for CSS hooks', () => {
    render(
      <Card hoverable clickable data-testid="card">
        x
      </Card>,
    );
    const root = screen.getByTestId('card');
    expect(root).toHaveAttribute('data-hoverable', 'true');
    expect(root).toHaveAttribute('data-clickable', 'true');
  });
});

describe('Card — color accents', () => {
  it.each(COLORS)('selected × %s applies the role ring', (color) => {
    render(
      <Card selected color={color} data-testid={`card-${color}`}>
        x
      </Card>,
    );
    const root = screen.getByTestId(`card-${color}`);
    expect(root.className).toContain('ring-2');
  });

  it.each(COLORS)('clickable × %s applies role-tinted focus ring', (color) => {
    render(
      <Card clickable color={color} data-testid={`card-${color}`}>
        x
      </Card>,
    );
    const root = screen.getByTestId(`card-${color}`);
    expect(root.className).toContain('focus-visible:ring');
  });
});

describe('Card — asChild polymorphism', () => {
  it('renders the wrapped element with merged className', () => {
    render(
      <Card asChild data-testid="link">
        <a href="/x">content</a>
      </Card>,
    );
    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/x');
    expect(link.className).toContain('border');
  });

  it('does not force role="button" when asChild', () => {
    render(
      <Card asChild clickable data-testid="link">
        <a href="/x">content</a>
      </Card>,
    );
    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).not.toHaveAttribute('role', 'button');
  });
});

describe('Card.Header', () => {
  it('renders title, subtitle, avatar, and action slots', () => {
    render(
      <Card>
        <Card.Header
          avatar={<span data-testid="avatar">A</span>}
          title="My title"
          subtitle="Subtext"
          action={<button data-testid="action">Go</button>}
        />
      </Card>,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('My title')).toBeInTheDocument();
    expect(screen.getByText('Subtext')).toBeInTheDocument();
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('does not wrap title in an <h*> by default — consumer controls the level', () => {
    render(
      <Card>
        <Card.Header title="My title" />
      </Card>,
    );
    const heading = screen.queryByRole('heading');
    expect(heading).toBeNull();
  });

  it('forwards ref + className', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card>
        <Card.Header ref={ref} className="custom-header" title="x" data-testid="header" />
      </Card>,
    );
    expect(ref.current).toBe(screen.getByTestId('header'));
    expect(ref.current?.className).toContain('custom-header');
  });
});

describe('Card.Body / Card.Footer', () => {
  it('Body renders children inside the card', () => {
    render(
      <Card>
        <Card.Body data-testid="body">content</Card.Body>
      </Card>,
    );
    expect(screen.getByTestId('body')).toHaveTextContent('content');
  });

  it.each(FOOTER_ALIGNS)('Footer aligns children %s via justify-* class', (align) => {
    render(
      <Card>
        <Card.Footer align={align} data-testid={`footer-${align}`}>
          <button>x</button>
        </Card.Footer>
      </Card>,
    );
    const footer = screen.getByTestId(`footer-${align}`);
    expect(footer.className).toContain(`justify-${align}`);
  });
});

describe('Card.Divider', () => {
  it('renders a semantic <hr>', () => {
    render(
      <Card>
        <Card.Divider data-testid="divider" />
      </Card>,
    );
    const hr = screen.getByTestId('divider');
    expect(hr.tagName).toBe('HR');
  });
});

describe('Card — context propagation (size)', () => {
  it.each(SIZES)('size=%s propagates padding to subparts', (size) => {
    render(
      <Card size={size}>
        <Card.Header data-testid={`header-${size}`} title="t" />
        <Card.Body data-testid={`body-${size}`}>b</Card.Body>
        <Card.Footer data-testid={`footer-${size}`}>f</Card.Footer>
      </Card>,
    );
    const headerPadMap = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
    const bodyPadMap = { sm: 'pb-3', md: 'pb-4', lg: 'pb-6' };
    const footerPadMap = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
    expect(screen.getByTestId(`header-${size}`).className).toContain(headerPadMap[size]);
    expect(screen.getByTestId(`body-${size}`).className).toContain(bodyPadMap[size]);
    expect(screen.getByTestId(`footer-${size}`).className).toContain(footerPadMap[size]);
  });
});

describe('Card.Media', () => {
  it('renders an <img> when src is set', () => {
    render(
      <Card>
        <Card.Media src="https://example.com/a.png" alt="An image" data-testid="media" />
      </Card>,
    );
    const wrapper = screen.getByTestId('media');
    const img = wrapper.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('alt', 'An image');
  });

  it('renders arbitrary children when src is omitted', () => {
    render(
      <Card>
        <Card.Media data-testid="media">
          <div data-testid="placeholder">no image</div>
        </Card.Media>
      </Card>,
    );
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });

  it('applies aspectRatio via inline style', () => {
    render(
      <Card>
        <Card.Media
          src="https://example.com/a.png"
          alt="x"
          aspectRatio="16/9"
          data-testid="media"
        />
      </Card>,
    );
    const wrapper = screen.getByTestId('media');
    expect(wrapper.style.aspectRatio).toBe('16/9');
  });
});

describe('Card — compound namespace', () => {
  it('exposes every subpart as a property of Card', () => {
    expect(Card.Header).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(Card.Footer).toBeDefined();
    expect(Card.Media).toBeDefined();
    expect(Card.Divider).toBeDefined();
  });
});