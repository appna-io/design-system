import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Image } from '../src/Image';
import { renderWithTheme as render } from './utils';

const SRC = 'https://example.com/photo.jpg';

describe('Image — rendering', () => {
  it('renders an <img> with src, alt, and lazy loading by default', () => {
    render(<Image src={SRC} alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', SRC);
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('honors loading="eager"', () => {
    render(<Image src={SRC} alt="A photo" loading="eager" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  it('reserves the box via aspectRatio', () => {
    render(<Image src={SRC} alt="A photo" aspectRatio="4/3" />);
    expect(screen.getByRole('img')).toHaveStyle({ aspectRatio: '4/3' });
  });

  it('defaults to object-cover and exposes data-fit', () => {
    render(<Image src={SRC} alt="A photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('data-fit', 'cover');
    expect(img.className).toContain('object-cover');
  });

  it('maps fit="contain"', () => {
    render(<Image src={SRC} alt="A photo" fit="contain" />);
    expect(screen.getByRole('img').className).toContain('object-contain');
  });

  it('maps radius and shadow onto token utilities', () => {
    render(<Image src={SRC} alt="A photo" radius="xl" shadow="lg" />);
    const img = screen.getByRole('img');
    expect(img.className).toContain('rounded-xl');
    expect(img.className).toContain('shadow-lg');
  });

  it('is full-width by default and opts out via fullWidth={false}', () => {
    // Token-exact check — the base classes include `max-w-full`, which contains the
    // substring 'w-full', so a plain toContain would false-positive.
    const classTokens = () => screen.getByRole('img').className.split(/\s+/);
    const { rerender } = render(<Image src={SRC} alt="A photo" />);
    expect(classTokens()).toContain('w-full');
    rerender(<Image src={SRC} alt="A photo" fullWidth={false} />);
    expect(classTokens()).not.toContain('w-full');
  });
});

describe('Image — failure path', () => {
  it('swaps to the fallback slot on error, keeping the accessible name', () => {
    render(
      <Image src={SRC} alt="Gallery item" aspectRatio="4/3" fallback={<span>unavailable</span>} />,
    );
    fireEvent.error(screen.getByRole('img'));
    const box = screen.getByRole('img', { name: 'Gallery item' });
    expect(box.tagName).toBe('SPAN');
    expect(box).toHaveAttribute('data-image-fallback');
    expect(box).toHaveTextContent('unavailable');
    expect(box).toHaveStyle({ aspectRatio: '4/3' });
  });

  it('keeps a decorative (alt="") fallback out of the a11y tree', () => {
    const { container } = render(
      <Image src={SRC} alt="" fallback={<span>unavailable</span>} />,
    );
    fireEvent.error(container.querySelector('img')!);
    const box = container.querySelector('[data-image-fallback]')!;
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(box).not.toHaveAttribute('role');
  });

  it('without a fallback, keeps the native <img> (browser semantics)', () => {
    render(<Image src={SRC} alt="A photo" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').tagName).toBe('IMG');
  });
});
