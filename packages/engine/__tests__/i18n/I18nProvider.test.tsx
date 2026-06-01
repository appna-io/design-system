import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  I18nProvider,
  MissingI18nKeyError,
  useFormatters,
  useI18n,
  useLocale,
  useTranslator,
} from '../../src/i18n';
import { useDirection } from '../../src/direction';

interface Captured {
  locale: string;
  direction: string;
  dataGrid: unknown;
  toast: unknown;
  missing: unknown;
}

function Inspector({ onRead }: { onRead: (c: Captured) => void }) {
  const i18n = useI18n();
  if (!i18n) {
    onRead({ locale: '__none__', direction: 'ltr', dataGrid: undefined, toast: undefined, missing: undefined });
  } else {
    onRead({
      locale: i18n.locale,
      direction: i18n.direction,
      dataGrid: i18n.get('DataGrid'),
      toast: i18n.get('Toast'),
      missing: i18n.get('NotPresent'),
    });
  }
  return null;
}

describe('I18nProvider / useI18n — backward-compatible namespace API', () => {
  it('returns null when no provider is present', () => {
    let captured: Captured | null = null;
    render(<Inspector onRead={(c) => (captured = c)} />);
    expect(captured!.locale).toBe('__none__');
  });

  it('exposes locale, derived direction, and namespaced get()', () => {
    let captured: Captured | null = null;
    render(
      <I18nProvider locale="he" messages={{ DataGrid: { foo: 'בר' } }}>
        <Inspector onRead={(c) => (captured = c)} />
      </I18nProvider>,
    );
    expect(captured!.locale).toBe('he');
    expect(captured!.direction).toBe('rtl');
    expect(captured!.dataGrid).toEqual({ foo: 'בר' });
    expect(captured!.missing).toBeUndefined();
  });

  it('honours explicit direction prop over locale-derived direction', () => {
    let captured: Captured | null = null;
    render(
      <I18nProvider locale="he" direction="ltr">
        <Inspector onRead={(c) => (captured = c)} />
      </I18nProvider>,
    );
    expect(captured!.locale).toBe('he');
    expect(captured!.direction).toBe('ltr');
  });

  it('derives ltr for unrecognized locales', () => {
    let captured: Captured | null = null;
    render(
      <I18nProvider locale="xx-YY">
        <Inspector onRead={(c) => (captured = c)} />
      </I18nProvider>,
    );
    expect(captured!.direction).toBe('ltr');
  });

  it('nested provider replaces locale/direction and shallow-merges messages', () => {
    let outerCapture: Captured | null = null;
    let innerCapture: Captured | null = null;
    render(
      <I18nProvider locale="en" messages={{ DataGrid: { foo: 'a' }, Toast: { close: 'x' } }}>
        <Inspector onRead={(c) => (outerCapture = c)} />
        <I18nProvider locale="he" messages={{ DataGrid: { foo: 'OVERRIDE' } }}>
          <Inspector onRead={(c) => (innerCapture = c)} />
        </I18nProvider>
      </I18nProvider>,
    );

    expect(outerCapture!.locale).toBe('en');
    expect(outerCapture!.direction).toBe('ltr');
    expect(outerCapture!.dataGrid).toEqual({ foo: 'a' });
    expect(outerCapture!.toast).toEqual({ close: 'x' });

    expect(innerCapture!.locale).toBe('he');
    expect(innerCapture!.direction).toBe('rtl');
    expect(innerCapture!.dataGrid).toEqual({ foo: 'OVERRIDE' });
    expect(innerCapture!.toast).toEqual({ close: 'x' });
  });

  it('memoizes the context value across renders with stable inputs', () => {
    const messages = { DataGrid: { foo: 'a' } };
    const captures: Array<unknown> = [];

    function Capturer() {
      const i18n = useI18n();
      captures.push(i18n);
      return null;
    }

    const { rerender } = render(
      <I18nProvider locale="en" messages={messages}>
        <Capturer />
      </I18nProvider>,
    );
    rerender(
      <I18nProvider locale="en" messages={messages}>
        <Capturer />
      </I18nProvider>,
    );

    expect(captures).toHaveLength(2);
    expect(captures[0]).toBe(captures[1]);
  });
});

describe('I18nProvider — direction context bridge', () => {
  it('wraps children in a DirectionProvider so useDirection() reads the provider value', () => {
    let observedDir: string | undefined;
    function DirReader() {
      observedDir = useDirection();
      return null;
    }
    render(
      <I18nProvider locale="he">
        <DirReader />
      </I18nProvider>,
    );
    expect(observedDir).toBe('rtl');
  });
});

describe('I18nProvider — t() dotted-path lookup with interpolation', () => {
  it('resolves a flat key', () => {
    let captured: string | undefined;
    function R() {
      captured = useI18n()!.t('stepper.previous');
      return null;
    }
    render(
      <I18nProvider
        locale="en"
        messages={{ stepper: { previous: 'Previous' } }}
        silentMissing
      >
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('Previous');
  });

  it('interpolates {param}', () => {
    let captured: string | undefined;
    function R() {
      captured = useI18n()!.t('stepper.stepOf', { current: 2, total: 5 });
      return null;
    }
    render(
      <I18nProvider
        locale="en"
        messages={{ stepper: { stepOf: 'Step {current} of {total}' } }}
        silentMissing
      >
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('Step 2 of 5');
  });

  it('returns the key when missing + silentMissing=true', () => {
    let captured: string | undefined;
    function R() {
      captured = useI18n()!.t('not.there');
      return null;
    }
    render(
      <I18nProvider locale="en" silentMissing>
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('not.there');
  });

  it('throws MissingI18nKeyError when silentMissing=false', () => {
    function R() {
      useI18n()!.t('not.there');
      return null;
    }
    expect(() =>
      render(
        <I18nProvider locale="en" silentMissing={false}>
          <R />
        </I18nProvider>,
      ),
    ).toThrowError(MissingI18nKeyError);
  });
});

describe('I18nProvider — tn() plural-keyed lookup', () => {
  it('selects the right plural category', () => {
    const captures: string[] = [];
    function R({ count }: { count: number }) {
      captures.push(useI18n()!.tn('cart.items', count));
      return null;
    }
    render(
      <I18nProvider
        locale="en"
        messages={{ cart: { items: { one: '{count} item', other: '{count} items' } } }}
        silentMissing
      >
        <R count={1} />
        <R count={5} />
      </I18nProvider>,
    );
    expect(captures).toEqual(['1 item', '5 items']);
  });

  it('falls back to other when the selected category is missing', () => {
    let captured: string | undefined;
    function R() {
      // German has more plural categories, but the bundle only supplies `other` → that wins.
      captured = useI18n()!.tn('cart.items', 1);
      return null;
    }
    render(
      <I18nProvider
        locale="en"
        messages={{ cart: { items: { other: '{count} items' } } }}
        silentMissing
      >
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('1 items');
  });

  it('throws on missing when silentMissing=false', () => {
    function R() {
      useI18n()!.tn('cart.items', 1);
      return null;
    }
    expect(() =>
      render(
        <I18nProvider locale="en" silentMissing={false}>
          <R />
        </I18nProvider>,
      ),
    ).toThrowError(MissingI18nKeyError);
  });
});

describe('I18nProvider — formatters', () => {
  it('exposes formatters bound to the active locale', () => {
    let n: string | undefined;
    let c: string | undefined;
    function R() {
      const f = useFormatters()!;
      n = f.number(1234.5);
      c = f.currency(9.5, 'USD');
      return null;
    }
    render(
      <I18nProvider locale="en-US">
        <R />
      </I18nProvider>,
    );
    expect(n).toMatch(/1,234\.5/);
    expect(c).toMatch(/\$9\.50/);
  });

  it('returns null when no provider is present', () => {
    let result: unknown = 'init';
    function R() {
      result = useFormatters();
      return null;
    }
    render(<R />);
    expect(result).toBeNull();
  });

  it('honors formatters override prop', () => {
    let n: string | undefined;
    function R() {
      n = useFormatters()!.number(5);
      return null;
    }
    render(
      <I18nProvider
        locale="en-US"
        formatters={{ number: (v) => `<<${v}>>` }}
      >
        <R />
      </I18nProvider>,
    );
    expect(n).toBe('<<5>>');
  });
});

describe('useLocale + useTranslator selectors', () => {
  it('useLocale returns the provider locale or null', () => {
    let withProv: string | null = null;
    let withoutProv: string | null = null;
    function R({ to }: { to: (l: string | null) => void }) {
      to(useLocale());
      return null;
    }
    render(
      <I18nProvider locale="ar-EG">
        <R to={(l) => (withProv = l)} />
      </I18nProvider>,
    );
    render(<R to={(l) => (withoutProv = l)} />);
    expect(withProv).toBe('ar-EG');
    expect(withoutProv).toBeNull();
  });

  it('useTranslator(namespace) prefixes the namespace to keys', () => {
    let captured: string | undefined;
    function R() {
      const t = useTranslator('stepper');
      captured = t('previous');
      return null;
    }
    render(
      <I18nProvider locale="en" messages={{ stepper: { previous: 'Prev' } }} silentMissing>
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('Prev');
  });

  it('useTranslator without provider returns a fallback that interpolates the key', () => {
    let captured: string | undefined;
    function R() {
      const t = useTranslator('stepper');
      captured = t('Hello {n}', { n: 'world' });
      return null;
    }
    render(<R />);
    expect(captured).toBe('Hello world');
  });
});

describe('I18nProvider — silentMissing default', () => {
  it('defaults to true under NODE_ENV=production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      let captured: string | undefined;
      function R() {
        captured = useI18n()!.t('missing.key');
        return null;
      }
      render(
        <I18nProvider locale="en">
          <R />
        </I18nProvider>,
      );
      expect(captured).toBe('missing.key');
    } finally {
      process.env.NODE_ENV = original;
    }
  });

  it('defaults to false (throws) under non-production NODE_ENV', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      function R() {
        useI18n()!.t('missing.key');
        return null;
      }
      expect(() =>
        render(
          <I18nProvider locale="en">
            <R />
          </I18nProvider>,
        ),
      ).toThrowError(MissingI18nKeyError);
    } finally {
      process.env.NODE_ENV = original;
    }
  });
});