import { describe, expect, it } from 'vitest';

import { deltaPresentation } from '../src/Stat';

describe('deltaPresentation', () => {
  it('up → positive tone + up arrow + plus sign', () => {
    const out = deltaPresentation({ value: 12.3, direction: 'up' });
    expect(out.tone).toBe('positive');
    expect(out.arrow).toBe('up');
    expect(out.sign).toBe('+');
    expect(out.formatted).toBe('+12.3%');
  });

  it('down → negative tone + down arrow + Unicode minus', () => {
    const out = deltaPresentation({ value: 5, direction: 'down' });
    expect(out.tone).toBe('negative');
    expect(out.arrow).toBe('down');
    expect(out.sign).toBe('\u2212');
    expect(out.formatted).toBe('\u22125%');
  });

  it('neutral → neutral tone + flat arrow + empty sign', () => {
    const out = deltaPresentation({ value: 0, direction: 'neutral' });
    expect(out.tone).toBe('neutral');
    expect(out.arrow).toBe('flat');
    expect(out.sign).toBe('');
    expect(out.formatted).toBe('0%');
  });

  it('inverse flips up to negative', () => {
    const out = deltaPresentation({ value: 5, direction: 'up' }, true);
    expect(out.tone).toBe('negative');
  });

  it('inverse flips down to positive (churn metaphor)', () => {
    const out = deltaPresentation({ value: 5, direction: 'down' }, true);
    expect(out.tone).toBe('positive');
  });

  it('inverse does not change neutral', () => {
    const out = deltaPresentation({ value: 0, direction: 'neutral' }, true);
    expect(out.tone).toBe('neutral');
  });

  it('label override replaces formatted string but keeps tone/arrow', () => {
    const out = deltaPresentation({
      value: 5,
      direction: 'up',
      label: '+$120',
    });
    expect(out.formatted).toBe('+$120');
    expect(out.tone).toBe('positive');
    expect(out.arrow).toBe('up');
  });

  it('custom suffix is honored', () => {
    const out = deltaPresentation({ value: 0.3, direction: 'down', suffix: 's' });
    expect(out.formatted).toBe('\u22120.3s');
  });

  it('ariaText announces direction + magnitude + suffix', () => {
    expect(deltaPresentation({ value: 12.3, direction: 'up' }).ariaText).toMatch(/up 12\.3%/);
    expect(deltaPresentation({ value: 5, direction: 'down' }).ariaText).toMatch(/down 5%/);
    expect(deltaPresentation({ value: 0, direction: 'neutral' }).ariaText).toMatch(/unchanged/);
  });

  it('reads inverse flag from the delta object when no override passed', () => {
    const out = deltaPresentation({ value: 5, direction: 'down', inverse: true });
    expect(out.tone).toBe('positive');
  });
});
