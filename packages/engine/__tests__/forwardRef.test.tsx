import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { forwardRef } from '../src/forwardRef';

interface BoxProps {
  label: string;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ label }, ref) => (
    <div ref={ref} data-testid="box">
      {label}
    </div>
  ),
  'Box',
);

describe('forwardRef', () => {
  it('forwards refs to the underlying element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Box ref={ref} label="hi" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.dataset.testid).toBe('box');
  });

  it('sets displayName when provided', () => {
    expect(Box.displayName).toBe('Box');
  });

  it('passes props through', () => {
    const { getByTestId } = render(<Box label="hello" />);
    expect(getByTestId('box').textContent).toBe('hello');
  });
});
