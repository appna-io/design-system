import { describe, expect, it } from 'vitest';

import { formatBytes } from '../src/FileUpload/headless/formatBytes';
import { matchAccept } from '../src/FileUpload/headless/matchAccept';
import { validateFile } from '../src/FileUpload/headless/validateFile';

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('formatBytes', () => {
  it('formats zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats megabytes in en-US', () => {
    expect(formatBytes(1_234_567, 'en-US')).toMatch(/1\.2 MB/);
  });
});

describe('matchAccept', () => {
  it('accepts image/* wildcard', () => {
    expect(matchAccept(makeFile('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchAccept(makeFile('a.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  it('accepts extension tokens', () => {
    expect(matchAccept(makeFile('doc.PDF', 'application/pdf'), '.pdf')).toBe(true);
  });
});

describe('validateFile', () => {
  it('rejects oversize files', () => {
    const result = validateFile(makeFile('big.bin', 'application/octet-stream', 2000), {
      maxSize: 1000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('size');
  });

  it('runs custom validator', () => {
    const result = validateFile(makeFile('a.txt', 'text/plain'), {
      validator: () => 'nope',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('custom');
  });
});