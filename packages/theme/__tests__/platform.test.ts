import { afterEach, describe, expect, it, vi } from 'vitest';
import { DETECT_PLATFORM_EXPR, detectPlatform } from '../src/platform';

const ORIGINAL_NAVIGATOR = globalThis.navigator;

function mockNavigator(userAgent: string, vendor = 'Apple Computer, Inc.'): void {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent, vendor },
  });
}

function restoreNavigator(): void {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: ORIGINAL_NAVIGATOR,
  });
}

afterEach(() => {
  restoreNavigator();
  vi.restoreAllMocks();
});

describe('detectPlatform', () => {
  it("returns 'apple' for desktop macOS Safari", () => {
    mockNavigator(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      'Apple Computer, Inc.',
    );
    expect(detectPlatform()).toBe('apple');
  });

  it("returns 'apple' for iOS Safari", () => {
    mockNavigator(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'Apple Computer, Inc.',
    );
    expect(detectPlatform()).toBe('apple');
  });

  it("returns 'other' for Chrome on macOS (excluded — Blink, not WebKit)", () => {
    mockNavigator(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Google Inc.',
    );
    expect(detectPlatform()).toBe('other');
  });

  it("returns 'other' for Chrome iOS (uses WebKit but reports CriOS)", () => {
    mockNavigator(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1',
      'Apple Computer, Inc.',
    );
    expect(detectPlatform()).toBe('other');
  });

  it("returns 'other' for Firefox", () => {
    mockNavigator(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
      '',
    );
    expect(detectPlatform()).toBe('other');
  });

  it("returns 'other' for Edge", () => {
    mockNavigator(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'Google Inc.',
    );
    expect(detectPlatform()).toBe('other');
  });

  it("returns 'other' when navigator is undefined (SSR)", () => {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: undefined });
    expect(detectPlatform()).toBe('other');
  });
});

describe('DETECT_PLATFORM_EXPR', () => {
  it('agrees with detectPlatform() for the same UA strings', () => {
    const fixtures: Array<{ ua: string; vendor: string; expected: 'apple' | 'other' }> = [
      {
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        vendor: 'Apple Computer, Inc.',
        expected: 'apple',
      },
      {
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124 Safari/537.36',
        vendor: 'Google Inc.',
        expected: 'other',
      },
      {
        ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
        vendor: '',
        expected: 'other',
      },
    ];

    for (const { ua, vendor, expected } of fixtures) {
      mockNavigator(ua, vendor);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const inline = new Function(`return ${DETECT_PLATFORM_EXPR};`)();
      expect(inline).toBe(expected);
      expect(detectPlatform()).toBe(expected);
    }
  });
});