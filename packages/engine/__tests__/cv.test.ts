import { describe, expect, it } from 'vitest';
import { cv } from '../src/cv';

describe('cv', () => {
  const button = cv({
    base: 'inline-flex items-center rounded-md transition',
    variants: {
      size: { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' },
      color: { primary: 'bg-blue-500', danger: 'bg-red-500', neutral: 'bg-zinc-500' },
      fullWidth: { true: 'w-full' },
    },
    compoundVariants: [
      { size: 'sm', color: 'primary', class: 'shadow-sm' },
      { size: 'lg', color: 'danger', class: 'shadow-xl' },
    ],
    defaultVariants: {
      size: 'md',
      color: 'primary',
      fullWidth: false,
    },
  });

  it('applies base classes', () => {
    const result = button();
    expect(result).toContain('inline-flex');
    expect(result).toContain('items-center');
    expect(result).toContain('rounded-md');
  });

  it('applies default variants when no props passed', () => {
    const result = button();
    expect(result).toContain('h-10');
    expect(result).toContain('px-4');
    expect(result).toContain('bg-blue-500');
  });

  it('applies explicit variant values', () => {
    const result = button({ size: 'lg', color: 'danger' });
    expect(result).toContain('h-12');
    expect(result).toContain('px-6');
    expect(result).toContain('bg-red-500');
  });

  it('applies boolean variants', () => {
    const result = button({ fullWidth: true });
    expect(result).toContain('w-full');
  });

  it('does not apply boolean variants when false', () => {
    const result = button({ fullWidth: false });
    expect(result).not.toContain('w-full');
  });

  it('applies compound variants when conditions match', () => {
    const small = button({ size: 'sm', color: 'primary' });
    expect(small).toContain('shadow-sm');

    const large = button({ size: 'lg', color: 'danger' });
    expect(large).toContain('shadow-xl');
  });

  it('does not apply compound when conditions do not all match', () => {
    const result = button({ size: 'sm', color: 'danger' });
    expect(result).not.toContain('shadow-sm');
    expect(result).not.toContain('shadow-xl');
  });

  it('user className wins (tailwind-merge resolves conflicts)', () => {
    const result = button({ size: 'md', className: 'h-20' });
    expect(result).not.toContain('h-10');
    expect(result).toContain('h-20');
  });

  it('expands responsive variants into breakpoint-prefixed classes', () => {
    const result = button({ size: { base: 'sm', md: 'lg' } });
    // tailwind-merge keeps the prefixed copies since they're different breakpoints
    expect(result).toContain('h-8');
    expect(result).toContain('md:h-12');
    expect(result).toContain('px-3');
    expect(result).toContain('md:px-6');
  });

  it('handles all-breakpoint responsive variants', () => {
    const result = button({
      size: { base: 'sm', sm: 'md', lg: 'lg' },
    });
    expect(result).toContain('h-8');
    expect(result).toContain('sm:h-10');
    expect(result).toContain('lg:h-12');
  });

  it('returns empty class for variant value with no mapping', () => {
    const result = button({ size: 'nonexistent' as never });
    // Falls back: no size class, but base + defaults for color stay
    expect(result).not.toContain('h-8');
    expect(result).not.toContain('h-10');
    expect(result).not.toContain('h-12');
    expect(result).toContain('bg-blue-500'); // default color still applies
  });

  it('compound matching uses base value of responsive props', () => {
    const result = button({ size: { base: 'sm', md: 'lg' }, color: 'primary' });
    // base size is 'sm', color is 'primary' → matches first compound → shadow-sm
    expect(result).toContain('shadow-sm');
  });

  it('compound supports array of accepted values', () => {
    const flexible = cv({
      base: '',
      variants: { color: { red: 'text-red-500', blue: 'text-blue-500', green: 'text-green-500' } },
      compoundVariants: [{ color: ['red', 'green'], class: 'font-bold' }],
    });
    expect(flexible({ color: 'red' })).toContain('font-bold');
    expect(flexible({ color: 'green' })).toContain('font-bold');
    expect(flexible({ color: 'blue' })).not.toContain('font-bold');
  });
});