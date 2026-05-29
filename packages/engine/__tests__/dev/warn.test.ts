import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetWarnCache, warn } from '../../src/dev/warn';

describe('warn', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetWarnCache();
    spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('does nothing when condition is truthy', () => {
    warn(true, 'should not log');
    warn('non-empty', 'should not log either');
    warn(1, 'nope');
    expect(spy).not.toHaveBeenCalled();
  });

  it('logs when condition is falsy', () => {
    warn(false, 'this should log');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('[apx-ds] this should log');
  });

  it('includes the code when provided', () => {
    warn(false, 'check label', 'SDS-001');
    expect(spy).toHaveBeenCalledWith('[apx-ds][SDS-001] check label');
  });

  it('deduplicates identical messages', () => {
    warn(false, 'same message');
    warn(false, 'same message');
    warn(false, 'same message');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('treats different codes as different messages', () => {
    warn(false, 'same', 'A');
    warn(false, 'same', 'B');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
