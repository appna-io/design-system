import { describe, expect, it } from 'vitest';

import {
  isStepClickable,
  resolveConnectorStatus,
  resolveStepStatus,
} from '../src/Stepper';

describe('resolveStepStatus', () => {
  describe('auto-derivation from activeIndex (no explicit override)', () => {
    it('renders completed for index < activeIndex', () => {
      expect(resolveStepStatus({ index: 0, activeIndex: 2 })).toBe('complete');
      expect(resolveStepStatus({ index: 1, activeIndex: 2 })).toBe('complete');
    });

    it('renders active for index === activeIndex', () => {
      expect(resolveStepStatus({ index: 2, activeIndex: 2 })).toBe('active');
    });

    it('renders pending for index > activeIndex', () => {
      expect(resolveStepStatus({ index: 3, activeIndex: 2 })).toBe('pending');
      expect(resolveStepStatus({ index: 10, activeIndex: 2 })).toBe('pending');
    });
  });

  describe('explicit overrides', () => {
    it('explicit "error" always wins', () => {
      expect(resolveStepStatus({ index: 0, activeIndex: 0, explicit: 'error' })).toBe('error');
      expect(resolveStepStatus({ index: 5, activeIndex: 0, explicit: 'error' })).toBe('error');
    });

    it('explicit "loading" always wins', () => {
      expect(resolveStepStatus({ index: 2, activeIndex: 0, explicit: 'loading' })).toBe('loading');
    });

    it('explicit "complete" always wins (even on pending steps)', () => {
      expect(resolveStepStatus({ index: 5, activeIndex: 0, explicit: 'complete' })).toBe(
        'complete',
      );
    });

    it('explicit "active" only honored when aligned with activeIndex', () => {
      expect(resolveStepStatus({ index: 2, activeIndex: 2, explicit: 'active' })).toBe('active');
      // mismatch → falls through to auto-derivation
      expect(resolveStepStatus({ index: 1, activeIndex: 2, explicit: 'active' })).toBe('complete');
      expect(resolveStepStatus({ index: 3, activeIndex: 2, explicit: 'active' })).toBe('pending');
    });

    it('explicit "pending" is a no-op (same as undefined)', () => {
      expect(resolveStepStatus({ index: 0, activeIndex: 2, explicit: 'pending' })).toBe('complete');
      expect(resolveStepStatus({ index: 2, activeIndex: 2, explicit: 'pending' })).toBe('active');
      expect(resolveStepStatus({ index: 5, activeIndex: 2, explicit: 'pending' })).toBe('pending');
    });
  });
});

describe('resolveConnectorStatus', () => {
  it('mirrors complete steps', () => {
    expect(resolveConnectorStatus('complete')).toBe('complete');
  });

  it('treats active + loading as active', () => {
    expect(resolveConnectorStatus('active')).toBe('active');
    expect(resolveConnectorStatus('loading')).toBe('active');
  });

  it('mirrors error', () => {
    expect(resolveConnectorStatus('error')).toBe('error');
  });

  it('mirrors pending', () => {
    expect(resolveConnectorStatus('pending')).toBe('pending');
  });
});

describe('isStepClickable', () => {
  const base = {
    index: 0,
    activeIndex: 0,
    status: 'pending' as const,
    clickable: false as boolean | 'completed',
    linear: false,
    disabled: false,
  };

  it('blocks when clickable=false', () => {
    expect(isStepClickable(base)).toBe(false);
  });

  it('allows when clickable=true and not linear', () => {
    expect(isStepClickable({ ...base, clickable: true })).toBe(true);
  });

  it('blocks when disabled', () => {
    expect(isStepClickable({ ...base, clickable: true, disabled: true })).toBe(false);
  });

  describe('clickable="completed"', () => {
    it('allows only complete steps', () => {
      expect(isStepClickable({ ...base, clickable: 'completed', status: 'complete' })).toBe(true);
    });

    it('blocks active / pending / error / loading', () => {
      expect(isStepClickable({ ...base, clickable: 'completed', status: 'active' })).toBe(false);
      expect(isStepClickable({ ...base, clickable: 'completed', status: 'pending' })).toBe(false);
      expect(isStepClickable({ ...base, clickable: 'completed', status: 'error' })).toBe(false);
      expect(isStepClickable({ ...base, clickable: 'completed', status: 'loading' })).toBe(false);
    });
  });

  describe('linear mode', () => {
    it('allows completed steps (index < activeIndex)', () => {
      expect(
        isStepClickable({
          ...base,
          clickable: true,
          linear: true,
          index: 0,
          activeIndex: 2,
          status: 'complete',
        }),
      ).toBe(true);
    });

    it('allows the active step (index === activeIndex)', () => {
      expect(
        isStepClickable({
          ...base,
          clickable: true,
          linear: true,
          index: 2,
          activeIndex: 2,
          status: 'active',
        }),
      ).toBe(true);
    });

    it('blocks pending steps (index > activeIndex)', () => {
      expect(
        isStepClickable({
          ...base,
          clickable: true,
          linear: true,
          index: 3,
          activeIndex: 2,
          status: 'pending',
        }),
      ).toBe(false);
    });
  });
});