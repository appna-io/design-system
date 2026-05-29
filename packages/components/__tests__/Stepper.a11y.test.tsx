import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import {
  Stepper,
  type StepData,
  type StepperOrientation,
  type StepperSize,
  type StepperVariant,
} from '../src/Stepper';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const STEPS: StepData[] = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

const VARIANTS: StepperVariant[] = ['numbered', 'dots', 'progress'];
const ORIENTATIONS: StepperOrientation[] = ['horizontal', 'vertical'];
const SIZES: StepperSize[] = ['sm', 'md', 'lg'];

describe('Stepper — axe matrix', () => {
  it('default horizontal passes axe', async () => {
    const { container } = render(<Stepper active={1} steps={STEPS} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('clickable + linear passes axe', async () => {
    const { container } = render(
      <Stepper active={2} steps={STEPS} clickable linear onStepClick={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('error step passes axe', async () => {
    const { container } = render(
      <Stepper
        active={1}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', status: 'error' },
          { id: 'c', label: 'C' },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading step passes axe', async () => {
    const { container } = render(
      <Stepper
        active={1}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', status: 'loading' },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('compound API passes axe', async () => {
    const { container } = render(
      <Stepper active={1} orientation="vertical">
        <Stepper.Step id="a" label="A" />
        <Stepper.Step id="b" label="B">
          <div>Body</div>
        </Stepper.Step>
        <Stepper.Step id="c" label="C" />
      </Stepper>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  for (const variant of VARIANTS) {
    for (const orientation of ORIENTATIONS) {
      for (const size of SIZES) {
        it(`variant=${variant} orientation=${orientation} size=${size} passes axe`, async () => {
          const { container } = render(
            <Stepper
              active={1}
              steps={STEPS}
              variant={variant}
              orientation={orientation}
              size={size}
            />,
          );
          expect(await axe(container)).toHaveNoViolations();
        });
      }
    }
  }
});

describe('Stepper — semantic structure', () => {
  it('renders <ol> + <li> structure', () => {
    const { container } = render(<Stepper active={1} steps={STEPS} />);
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol?.getAttribute('aria-label')).toBe('Progress');

    const items = ol?.querySelectorAll('li[data-stepper-item]');
    expect(items?.length).toBe(4);
  });

  it('marks exactly one step with aria-current=step', () => {
    const { container } = render(<Stepper active={2} steps={STEPS} />);
    const currents = container.querySelectorAll('[data-stepper-item][aria-current="step"]');
    expect(currents.length).toBe(1);
  });

  it('composed aria-label includes step n of total + status (interactive mode)', () => {
    render(<Stepper active={1} steps={STEPS} clickable onStepClick={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Step 1 of 4: Account, complete' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Step 2 of 4: Profile, in progress' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Step 4 of 4: Review, not started' }),
    ).toBeInTheDocument();
  });
});
